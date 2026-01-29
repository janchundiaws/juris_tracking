const express = require('express');
require('dotenv').config();
const cors = require('cors');
const swaggerDocs = require('./src/config/swagger');
const { verifyToken, generateToken } = require('./src/middleware/auth');
const { sequelize, testConnection } = require('./src/config/database');
const usuariosRoutes = require('./src/routes/usuarios');
const rabbitmqRoutes = require('./src/routes/rabbitmq');
const { startUserConsumer } = require('./src/consumers/userConsumer');

const app = express();
const PORT = process.env.PORT || 3003;

// CORS - Permitir solicitudes desde el frontend
app.use(cors({
  origin: '*', // En producción, especifica el dominio exacto
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Swagger Documentation
swaggerDocs(app, PORT);


// Rutas de RabbitMQ
app.use('/api/rabbitmq', rabbitmqRoutes);
// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna el token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenciales inválidas
 */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validación básica (en producción, validar contra base de datos)
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos' });
  }

  // Simular validación de usuario
  if (email === 'test@example.com' && password === 'password123') {
    const token = generateToken({
      id: 1,
      email: email,
      role: 'admin'
    });

    return res.json({
      message: 'Login exitoso',
      token: token
    });
  }

  res.status(401).json({ error: 'Credenciales inválidas' });
});

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Ruta protegida - requiere autenticación
 *     tags:
 *       - Datos Protegidos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos protegidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o expirado
 */
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Estado del servidor
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: Servidor operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor y base de datos
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos');

    // Iniciar consumer de RabbitMQ
    await startUserConsumer();
    console.log('✅ Consumer de RabbitMQ iniciado');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
      console.log(`🐰 RabbitMQ consumer escuchando mensajes`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
