const express = require('express');
require('dotenv').config();
const cors = require('cors');
const swaggerDocs = require('./src/config/swagger');
const { verifyToken, generateToken } = require('./src/middleware/auth');
const { sequelize, testConnection } = require('./src/config/database');
const usuariosRoutes = require('./src/routes/users');
const citiesRoutes = require('./src/routes/cities');
const maestroRoutes = require('./src/routes/maestro');
const lawyersRoutes = require('./src/routes/lawyers');
const creditorsRoutes = require('./src/routes/creditors');
const judicialProcessesRoutes = require('./src/routes/judicial-processes');
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
// Rutas de ciudades
app.use('/api/cities', citiesRoutes);
// Rutas de maestro
app.use('/api/maestro', maestroRoutes);
// Rutas de abogados
app.use('/api/lawyers', lawyersRoutes);
// Rutas de acreedores
app.use('/api/creditors', creditorsRoutes);
// Rutas de procesos judiciales
app.use('/api/judicial-processes', judicialProcessesRoutes);

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
