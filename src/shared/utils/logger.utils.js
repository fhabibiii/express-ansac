/**
 * Logger Utility
 * Centralized logging system using Winston
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../../config/app.config');
const os = require('os');

// Avoid direct import of telegram.monitor to break circular dependency
// This will be dynamically loaded when needed
let telegramMonitor = null;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Batas monitoring CPU/Memory
const resourceThresholds = {
  cpuLoad: 80, // alert if CPU load > 80%
  memoryUsage: 85 // alert if memory usage > 85%
};

// Custom log formats dengan format baru [time] : [level] : [detail]
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
    // Format dengan format baru
    let formattedLevel = level.replace(/\u001b\[\d+m/g, ''); // Hapus kode warna untuk perhitungan panjang
    let logMessage = `[${timestamp}] : [${level}] : ${message}`;
    
    // Add important metadata but keep it concise
    if (meta.method && meta.url) {
      // For HTTP requests/responses, simplify the output
      return `${logMessage} (${meta.method} ${meta.url}${meta.statusCode ? ` ${meta.statusCode}` : ''})`;
    } else if (Object.keys(meta).length > 0 && !meta.stack) {
      // Add metadata but exclude large stack traces from console output
      const metaString = Object.entries(meta)
        .filter(([key]) => !['stack', 'timestamp', 'service'].includes(key))
        .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join(', ');
      
      if (metaString) {
        return `${logMessage} [${metaString}]`;
      }
    }
    
    return logMessage;
  })
);

// File log format - keep detailed JSON for analysis but also include new format
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Function to check system resources and send alerts if needed
const checkSystemResources = () => {
  try {
    // CPU load (using load average as approximation)
    const cpuLoad = os.loadavg()[0] * 100 / os.cpus().length; // normalized to percent of available CPU
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // Lazy load telegramMonitor to avoid circular dependency
    if (!telegramMonitor) {
      telegramMonitor = require('./telegram.monitor');
    }
    
    // Get instance of telegram monitor
    const monitor = telegramMonitor.getInstance();
    
    // Check CPU threshold
    if (cpuLoad > resourceThresholds.cpuLoad && monitor) {
      monitor.sendMessage(`⚠️ *System Alert: High CPU Usage*\nCPU Load: ${cpuLoad.toFixed(1)}%\nServer: ${os.hostname()}\nTime: ${new Date().toISOString()}`);
      logger.warn(`High CPU usage detected: ${cpuLoad.toFixed(1)}%`, { cpuLoad, type: 'resource_alert' });
    }
    
    // Check memory threshold
    if (memoryUsage > resourceThresholds.memoryUsage && monitor) {
      monitor.sendMessage(`⚠️ *System Alert: High Memory Usage*\nMemory Usage: ${memoryUsage.toFixed(1)}%\nFree: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\nServer: ${os.hostname()}\nTime: ${new Date().toISOString()}`);
      logger.warn(`High memory usage detected: ${memoryUsage.toFixed(1)}%`, { memoryUsage, freeMem, totalMem, type: 'resource_alert' });
    }
  } catch (err) {
    logger.error('Error checking system resources', { error: err.message });
  }
};

// Schedule resource checks every 5 minutes
setInterval(checkSystemResources, 5 * 60 * 1000);

// Create Winston logger instance
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  defaultMeta: { service: 'ansac-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    })
  ]
});

// Add console transport with improved formatting for development environment
if (config.app.environment !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Kirim error ke Telegram
const originalErrorMethod = logger.error;
logger.error = function(message, meta = {}) {
  // Panggil metode error asli
  originalErrorMethod.call(this, message, meta);
  
  // Jangan kirim lagi ke Telegram jika sudah diproses oleh handleError di base.controller
  // Ini mencegah duplikasi pesan error di Telegram
  if (meta && meta.telegramNotificationSent) {
    return this;
  }
  
  // Kirim error ke Telegram (hanya untuk error sistem)
  try {
    // Lazy load telegramMonitor to avoid circular dependency
    if (!telegramMonitor) {
      telegramMonitor = require('./telegram.monitor');
    }
    
    const monitor = telegramMonitor.getInstance();
    if (monitor) {
      // Format detail error untuk Telegram
      let errorDetails = meta;
      if (meta instanceof Error) {
        errorDetails = { 
          message: meta.message, 
          stack: meta.stack,
          name: meta.name
        };
      }
      
      monitor.reportError(meta instanceof Error ? meta : new Error(message), {
        context: 'Logger error',
        meta: errorDetails
      });
    }
  } catch (err) {
    // Log ke konsol jika error saat mengirim ke Telegram
    console.error('Failed to send error to Telegram:', err);
  }
  
  return this;
};

// Create a middleware to attach logger to request object and track request timing
const loggerMiddleware = (req, res, next) => {
  // Store start time for calculating response time
  req.startTime = Date.now();
  req.logger = logger;
  
  // Log request details - simplified in console but detailed in files
  logger.info(`Incoming request`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });
  
  // Track response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - req.startTime;
    
    // Log response details - status code coloring will be handled by colorize format
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel](`Response completed in ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Run initial system resource check
checkSystemResources();

module.exports = {
  logger,
  loggerMiddleware,
  checkSystemResources // Export for testing or manual checks
};