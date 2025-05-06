/**
 * Environment Variables Validation
 * Ensures all required environment variables are set
 */

const { logger } = require('./logger.utils');

/**
 * Validates required environment variables
 * @param {Object} options - Validation options
 * @param {boolean} options.exitOnFailure - Whether to exit process if validation fails
 * @returns {Object} Validation result
 */
const validateEnv = (options = { exitOnFailure: true }) => {
  const requiredVars = {
    // Database
    DATABASE_URL: 'Database connection string is required',
    
    // Application settings
    NODE_ENV: 'Application environment must be set (development/production/test)',
    
    // Security
    JWT_SECRET: 'JWT secret key is required for token generation',
    JWT_EXPIRES_IN: 'JWT expiration time is required',
    JWT_REFRESH_EXPIRES_IN: 'JWT refresh token expiration time is required',
  };
  
  const productionOnlyVars = {
    JWT_SECRET: 'Strong JWT secret must be set in production',
    CORS_ORIGIN: 'CORS origin should be explicitly set in production',
  };
  
  const optionalVars = {
    // Telegram Bot for monitoring
    TELEGRAM_BOT_TOKEN: 'Telegram bot token for server monitoring notifications',
    TELEGRAM_CHAT_ID: 'Telegram chat ID where notifications will be sent',
  };
  
  const errors = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check required variables
  Object.entries(requiredVars).forEach(([name, message]) => {
    if (!process.env[name]) {
      errors.push(`Missing ${name}: ${message}`);
    }
  });
  
  // Check production-only variables
  if (isProduction) {
    Object.entries(productionOnlyVars).forEach(([name, message]) => {
      if (!process.env[name]) {
        errors.push(`Missing ${name}: ${message}`);
      }
    });
    
    // Check for secure JWT_SECRET in production
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long for security');
    }
    
    // Check if using default DATABASE_URL in production
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
      warnings.push('Using localhost DATABASE_URL in production is not recommended');
    }
  }
  
  // Check optional variables pairs
  if (process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_CHAT_ID) {
    warnings.push('TELEGRAM_BOT_TOKEN is set but TELEGRAM_CHAT_ID is missing. Telegram notifications will not work properly.');
  }
  
  if (!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    warnings.push('TELEGRAM_CHAT_ID is set but TELEGRAM_BOT_TOKEN is missing. Telegram notifications will not work properly.');
  }
  
  if (isProduction && !process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_CHAT_ID) {
    warnings.push('Telegram monitoring is not configured. Server status and error notifications will not be sent.');
  }
  
  // Log errors and warnings
  if (errors.length > 0) {
    logger.error('Environment validation failed:', { errors });
    
    if (options.exitOnFailure) {
      logger.error('ERROR: Missing required environment variables');
      errors.forEach(err => logger.error(`- ${err}`));
      logger.error('Please set these variables in your .env file or environment before starting the application.');
      process.exit(1);
    }
  }
  
  if (warnings.length > 0) {
    logger.warn('Environment warnings:', { warnings });
    
    if (isProduction) {
      logger.warn('WARNING: Potential issues in production configuration:');
      warnings.forEach(warn => logger.warn(`- ${warn}`));
    }
  }
  
  // Log what optional services are available
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    logger.info('Telegram monitoring is configured and enabled');
  } else {
    logger.info('Telegram monitoring is disabled');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

module.exports = {
  validateEnv
};