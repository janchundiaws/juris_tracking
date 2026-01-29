const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API JurisTracking',
      version: '1.0.0',
      description: 'Documentación de la API backend para JurisTracking',
      contact: {
        name: 'Equipo de Desarrollo',
      }
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.juristracking.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el JWT token'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./index.js', './src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Documentación de Swagger disponible en http://localhost:${port}/api-docs`);
};

module.exports = swaggerDocs;
