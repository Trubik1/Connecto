const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Connecto API',
      version: '1.0.0',
      description: 'API для нетворкинга на мероприятиях',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(options);