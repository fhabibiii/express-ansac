/**
 * Database Configuration
 * Setup and configuration for Prisma client
 */

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../shared/utils/logger.utils');

// Konfigurasi prisma client dengan logging dan connection management yang lebih baik
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
  // Konfigurasi connection pool
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Menambahkan event listeners untuk log dan monitoring
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  }
});

prisma.$on('error', (e) => {
  logger.error(`Database error: ${e.message}`, { error: e });
});

// Connection retry logic for greater resilience
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let currentTry = 0;
  
  while (currentTry < retries) {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      return;
    } catch (error) {
      currentTry++;
      logger.error(`Failed to connect to database (attempt ${currentTry}/${retries}):`, { error });
      
      if (currentTry >= retries) {
        logger.error('Maximum connection attempts reached, exiting application');
        process.exit(1);
      }
      
      logger.info(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Inisialisasi koneksi dengan retry logic
connectWithRetry();

// Add middleware untuk performance monitoring
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  // Log slow queries (>100ms)
  const duration = after - before;
  if (duration > 100) {
    logger.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`, {
      model: params.model,
      action: params.action,
      duration,
      args: JSON.stringify(params.args)
    });
  }
  
  return result;
});

// Handle process termination correctly
process.on('beforeExit', async () => {
  logger.info('Closing database connections...');
  await prisma.$disconnect();
});

module.exports = prisma;