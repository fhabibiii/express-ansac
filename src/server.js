/**
 * Server Entry Point
 * Bootstrap and start the Express server
 */

const app = require('./app');
const config = require('./config/app.config');
const prisma = require('./config/database.config');
const net = require('net');
const { scheduleBackups } = require('./utils/backup.utils');
const { logger } = require('./shared/utils/logger.utils');
const { validateEnv } = require('./shared/utils/env-validator.utils');
const telegramMonitor = require('./shared/utils/telegram.monitor');
const { startUserActivityMonitoring, stopUserActivityMonitoring } = require('./shared/utils/user-activity.utils');

// Validate environment variables before starting the server
validateEnv();

// Initialize Telegram monitoring
const monitor = telegramMonitor.init({
  token: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

// Set up global unhandled exception handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Send error to Telegram
  monitor.reportError(error, { type: 'uncaughtException' }).finally(() => {
    // Graceful shutdown
    shutdown(1, 'Uncaught Exception');
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Send error to Telegram
  monitor.reportError(reason, { 
    type: 'unhandledRejection',
    promise: String(promise)
  }).finally(() => {
    // Graceful shutdown
    shutdown(1, 'Unhandled Promise Rejection');
  });
});

// Validate environment
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not defined');
  process.exit(1);
}

if (config.app.environment === 'production' && !process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not defined in production');
  process.exit(1);
}

// Initialize database backup scheduler
scheduleBackups();

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(false)).close();
      })
      .listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort, maxAttempts = 10) {
  let port = startPort;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
    attempts++;
  }
  
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

// Start server with port handling
let server;
const preferredPort = config.app.port;

findAvailablePort(preferredPort)
  .then(port => {
    server = app.listen(port, () => {
      // Create a string with proper padding to ensure consistent right border
      const version = `Version: ${config.app.version}`;
      const environment = `Environment: ${config.app.environment}`;
      const portLine = `Port: ${port}`;
      const serverUrl = `Server is running at http://localhost:${port}`;
      const healthCheck = `Health check: http://localhost:${port}/health`;
      
      // Calculate proper padding lengths to ensure right border alignment
      const maxLength = 45; // Maximum content length
      const versionPad = " ".repeat(maxLength - version.length);
      const environmentPad = " ".repeat(maxLength - environment.length);
      const portPad = " ".repeat(maxLength - portLine.length);
      const serverUrlPad = " ".repeat(maxLength - serverUrl.length);
      const healthCheckPad = " ".repeat(maxLength - healthCheck.length);
      
      console.log(`
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   ANSAC API Server                              │
    │   ${version}${versionPad} │
    │   ${environment}${environmentPad} │
    │   ${portLine}${portPad} │
    │                                                 │
    │   ${serverUrl}${serverUrlPad} │
    │   ${healthCheck}${healthCheckPad} │
    │                                                 │
    └─────────────────────────────────────────────────┘
      `);
      
      // Send Telegram notification that server has started
      monitor.notifyServerStart({
        version: config.app.version,
        environment: config.app.environment,
        port
      });
      
      // Start periodic statistics reporting every 1 hour
      // 1 hour = 60 * 60 * 1000 = 3600000 ms
      monitor.startPeriodicStats(3600000);
      
      // Start user activity monitoring also every 1 hour
      startUserActivityMonitoring(3600000);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    // Report startup error to Telegram
    monitor.reportError(err, { context: 'Server startup' }).finally(() => {
      process.exit(1);
    });
  });

// Graceful shutdown function
function shutdown(code = 0, reason = 'Planned shutdown') {
  console.log(`Shutting down server... Reason: ${reason}`);
  
  // Send shutdown notification to Telegram
  monitor.notifyServerStop(reason).finally(() => {
    // Stop the stats interval
    monitor.stopPeriodicStats();
    
    // Stop user activity monitoring
    stopUserActivityMonitoring();
    
    server.close(async () => {
      console.log('HTTP server closed.');
      
      try {
        await prisma.$disconnect();
        console.log('Database connections closed.');
        process.exit(code);
      } catch (error) {
        console.error('Error during shutdown:', error);
        monitor.reportError(error, { context: 'Shutdown process' }).finally(() => {
          process.exit(1);
        });
      }
    });
    
    // Force shutdown if graceful shutdown fails
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  });
}

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  shutdown(0, 'SIGTERM signal received');
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  shutdown(0, 'SIGINT signal received');
});

module.exports = server;