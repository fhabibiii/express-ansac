/**
 * Express Application Setup
 * Main application configuration and middleware setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const { xss } = require('express-xss-sanitizer');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const config = require('./config/app.config');
const errorHandler = require('./shared/middlewares/errorHandler');
const { blacklistMiddleware } = require('./shared/middlewares/blacklist.middleware');
const { monitoringMiddleware, getMonitoringStats } = require('./shared/utils/monitoring.utils');
const { loggerMiddleware, logger } = require('./shared/utils/logger.utils');
const { apiLimiter } = require('./shared/middlewares/rate-limit.middleware');
const v1Routes = require('./api/v1/routes');
const cacheService = require('./services/cache.service');

// Initialize express app
const app = express();

// Apply monitoring middleware (should be first to accurately track all requests)
app.use(monitoringMiddleware);

// Apply logging middleware
app.use(loggerMiddleware);

// Apply security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Apply blacklist middleware (before rate limiting)
app.use(blacklistMiddleware);

// Apply global rate limiting (apiLimiter) to all routes
app.use(apiLimiter);

// Configure CORS
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

// Use compression for responses
app.use(compression());

// Parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply XSS sanitization to prevent XSS attacks
app.use(xss());

// Serve static files with enhanced security headers
app.use('/public', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'max-age=2592000'); // Cache for 30 days
  next();
}, express.static(path.join(__dirname, '../public')));

// API Documentation with Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// API routes
// We'll set up routes first without caching
const setupRedisCaching = () => {
  if (cacheService.isRedisAvailable()) {
    app.use('/api/v1/blogs/public', cacheService.cacheMiddleware(300));
    app.use('/api/v1/galleries/public', cacheService.cacheMiddleware(300));
    app.use('/api/v1/services/public', cacheService.cacheMiddleware(300));
    app.use('/api/v1/faqs/public', cacheService.cacheMiddleware(300));
    logger.info('Redis caching enabled for public endpoints');
  } else {
    logger.warn('Redis caching disabled - running without cache layer');
  }
};

// Main API routes
app.use('/api/v1', v1Routes);

// Set up Redis caching after a short delay to allow connection to establish
setTimeout(() => {
  setupRedisCaching();
}, 1000); // 1 second delay

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthStatus = await require('./shared/utils/health.utils').checkHealth();
    const statusCode = healthStatus.status === 'UP' ? 200 : 503; // Service Unavailable if health check fails
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date(),
      error: 'Health check failed',
      message: error.message
    });
  }
});

// Monitoring endpoint
app.get('/monitoring', (req, res) => {
  res.status(200).json(getMonitoringStats());
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    name: config.app.name,
    version: config.app.version,
    environment: config.app.environment,
    apiDocs: '/api-docs'
  });
});

// Redirect common mistyped endpoint
app.get('/api-doc', (req, res) => {
  res.redirect('/api-docs');
});

// Handle 404 errors
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;