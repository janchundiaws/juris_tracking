const express = require('express');
require('dotenv').config();
const cors = require('cors');
const swaggerDocs = require('./src/config/swagger');
const { verifyToken, generateToken } = require('./src/middleware/auth');
const { sequelize, testConnection } = require('./src/config/database');
const usuariosRoutes = require('./src/routes/users');
const provinciesRoutes = require('./src/routes/provincies');
const maestroRoutes = require('./src/routes/maestro');
const lawyersRoutes = require('./src/routes/lawyers');
const creditorsRoutes = require('./src/routes/creditors');
const judicialProcessesRoutes = require('./src/routes/judicial-processes');
const rabbitmqRoutes = require('./src/routes/rabbitmq');
const rolesRoutes = require('./src/routes/roles');
const documentsRoutes = require('./src/routes/documents');
const activitiesRoutes = require('./src/routes/activities');
const outlookRoutes = require('./src/routes/outlook');
//const consultarProcesoRoutes = require('./src/routes/consultarproceso');
const { startUserConsumer } = require('./src/consumers/userConsumer');
const Provincie = require('./src/models/Provincie');
const Role = require('./src/models/Role');
const Document = require('./src/models/Document');
const Activity = require('./src/models/Activities');
const Lawyer = require('./src/models/Lawyer');

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
// Rutas de provincias
app.use('/api/provincies', provinciesRoutes);
// Rutas de maestro
app.use('/api/maestro', maestroRoutes);
// Rutas de abogados
app.use('/api/lawyers', lawyersRoutes);
// Rutas de acreedores
app.use('/api/creditors', creditorsRoutes);
// Rutas de procesos judiciales
app.use('/api/judicial-processes', judicialProcessesRoutes);
// Rutas de roles
app.use('/api/roles', rolesRoutes);
// Rutas de documentos
app.use('/api/documents', documentsRoutes);
// Rutas de actividades
app.use('/api/activities', activitiesRoutes);
// Rutas de Outlook webhooks
//app.use('/api/outlook', outlookRoutes);
// Rutas de consulta de procesos
//app.use('/api/consultar-proceso', consultarProcesoRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Función para insertar datos iniciales de provincias
const insertDataInicial = async () => {
  try {
    const count = await Provincie.count();
    if (count === 0) {
      const defaultProvincies = [
        { name: 'Manabi', postal_code: '13' },
        { name: 'Pichincha', postal_code: '17' },
        { name: 'Guayas', postal_code: '09' },
        { name: 'Azuay', postal_code: '01' },
        { name: 'El Oro', postal_code: '07' },
        { name: 'Loja', postal_code: '11' },
        { name: 'Tungurahua', postal_code: '18' },
        { name: 'Cotopaxi', postal_code: '03' },
        { name: 'Imbabura', postal_code: '10' },
        { name: 'Carchi', postal_code: '02' },
        { name: 'Chimborazo', postal_code: '06' },
        { name: 'Bolivar', postal_code: '04' },
        { name: 'Zamora-Chinchipe', postal_code: '20' },
        { name: 'Sucumbios', postal_code: '22' },
        { name: 'Orellana', postal_code: '15' },
        { name: 'Napo', postal_code: '14' },
        { name: 'Pastaza', postal_code: '16' },
        { name: 'Santo Domingo de los Tsáchilas', postal_code: '24' },
        { name: 'Santa Elena', postal_code: '26' },
        { name: 'Galápagos', postal_code: '23' }

      ];
      
      await Provincie.bulkCreate(defaultProvincies);
      console.log('✅ Datos iniciales de provincias insertados');

      const countRoles = await Role.count();
      if (countRoles === 0) {
        const defaultRoles = [
          { name: 'admin' ,description: 'Administrador del sistema'},
          { name: 'abogado', description: 'Usuario con rol de abogado' },
          { name: 'asistente', description: 'Usuario con rol de asistente'}
        ];
        
        await Role.bulkCreate(defaultRoles);
        console.log('✅ Datos iniciales de roles insertados');  
    }

    }
  } catch (error) {
    console.error('❌ Error al insertar datos iniciales de provincias:', error);
  }
};

// Inicializar servidor y base de datos
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Inicializar asociaciones de modelos
    const models = {
      Activity,
      JudicialProcess: require('./src/models/JudicialProcess'),
      Lawyer
    };

    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });
    console.log('✅ Asociaciones de modelos inicializadas');

    // Sincronizar modelos con la base de datos
    // await sequelize.sync({ force: true });
    // console.log('✅ Modelos sincronizados con la base de datos');

    // // Insertar datos iniciales
    // await insertDataInicial();

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
