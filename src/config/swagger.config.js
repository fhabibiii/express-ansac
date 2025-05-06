/**
 * Swagger Configuration
 */
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ANSAC API',
    version: '1.0.0',
    description: 'API Documentation for ANSAC Application',
    contact: {
      name: 'ANSAC Team',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path to the API docs (use glob pattern to include all route files)
  apis: [
    './src/api/v1/routes/*.js',
    './src/docs/swagger/*.yaml',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;