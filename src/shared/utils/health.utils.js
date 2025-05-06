/**
 * Enhanced Health Check Utility
 * Provides detailed health information about the application's components
 */

const os = require('os');
const prisma = require('../../config/database.config');
const { logger } = require('./logger.utils');
const appConfig = require('../../config/app.config');
const cacheService = require('../../services/cache.service');

/**
 * Checks the health of the database connection
 * @returns {Promise<Object>} Database health status
 */
const checkDatabaseHealth = async () => {
  try {
    // Simple query to test database connectivity
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'UP',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'DOWN',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

/**
 * Checks the health of the Redis cache
 * @returns {Object} Redis health status
 */
const checkRedisHealth = async () => {
  try {
    if (!cacheService.isRedisAvailable()) {
      return {
        status: 'DOWN',
        message: 'Redis connection not established'
      };
    }
    
    // Test cache functionality with a ping
    const startTime = Date.now();
    await cacheService.client.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'UP',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    logger.debug('Redis health check failed:', error);
    return {
      status: 'DOWN',
      error: error.message
    };
  }
};

/**
 * Collects system information
 * @returns {Object} System information
 */
const getSystemInfo = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
      total: `${Math.round(totalMemory / (1024 * 1024 * 1024))} GB`,
      free: `${Math.round(freeMemory / (1024 * 1024 * 1024))} GB`,
      used: `${Math.round(usedMemory / (1024 * 1024 * 1024))} GB`,
      usagePercentage: `${Math.round((usedMemory / totalMemory) * 100)}%`
    },
    uptime: {
      os: `${Math.floor(os.uptime() / 3600)} hours, ${Math.floor((os.uptime() % 3600) / 60)} minutes`,
      process: `${Math.floor(process.uptime() / 3600)} hours, ${Math.floor((process.uptime() % 3600) / 60)} minutes`
    },
    loadAverage: os.loadavg()
  };
};

/**
 * Gets application information
 * @returns {Object} Application information
 */
const getAppInfo = () => {
  return {
    name: appConfig.app.name,
    version: appConfig.app.version,
    environment: appConfig.app.environment,
    nodeVersion: process.version,
    startTime: new Date(Date.now() - (process.uptime() * 1000)).toISOString()
  };
};

/**
 * Comprehensive health check function
 * @returns {Promise<Object>} Complete health status
 */
const checkHealth = async () => {
  const timestamp = new Date();
  const dbHealth = await checkDatabaseHealth();
  const redisHealth = await checkRedisHealth();
  
  // Determine overall status - if any critical component is DOWN, the overall is DOWN
  // Redis is not considered critical, so only database affects overall status
  const status = dbHealth.status === 'DOWN' ? 'DOWN' : 'UP';
  
  // Construct the complete health response
  const healthInfo = {
    status,
    timestamp,
    application: getAppInfo(),
    components: {
      database: dbHealth,
      redis: redisHealth
    }
  };
  
  // Include system info in development environment or when explicitly requested
  if (process.env.NODE_ENV === 'development' || process.env.INCLUDE_SYSTEM_INFO === 'true') {
    healthInfo.system = getSystemInfo();
  }
  
  if (status === 'DOWN') {
    logger.error('Health check returned DOWN status', healthInfo);
  }
  
  return healthInfo;
};

module.exports = {
  checkHealth,
  checkDatabaseHealth,
  checkRedisHealth,
  getSystemInfo,
  getAppInfo
};