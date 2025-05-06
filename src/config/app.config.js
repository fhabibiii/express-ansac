/**
 * Application Configuration
 * Centralized configuration for the entire application
 */

// Load environment variables
require('dotenv').config();

const config = {
  app: {
    name: 'ANSAC API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    url: process.env.API_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
  },
  upload: {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    directory: {
      profile: 'public/uploads/profile',
      blog: 'public/uploads/blog',
      gallery: 'public/uploads/gallery',
      service: 'public/uploads/service'
    },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  security: {
    bcryptSaltRounds: 10,
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100
  }
};

// Validate critical configuration
if (config.app.environment === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set in production. Using a default secret is a security risk!');
  }
}

module.exports = config;