/**
 * Telegram Monitoring Service
 * Sends notifications about server status, statistics, and errors to a Telegram group
 */

const TelegramBot = require('node-telegram-bot-api');
const os = require('os');
const dns = require('dns').promises;

// Avoid circular dependency by not requiring logger directly
// We'll use this simple local logger during initialization with matching colors
const localLogger = {
  info: (msg) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    // Add color only to the text "info", not to the brackets
    console.log(`[${time}] : [\x1b[32minfo\x1b[0m] : ${msg}`);
  },
  warn: (msg) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    // Add color only to the text "warn", not to the brackets
    console.warn(`[${time}] : [\x1b[33mwarn\x1b[0m] : ${msg}`);
  },
  error: (msg, err) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    // Add color only to the text "error", not to the brackets
    console.error(`[${time}] : [\x1b[31merror\x1b[0m] : ${msg}`, err || '');
  }
};

// Will be replaced with real logger after initialization
let logger = localLogger;

// Avoid direct import of monitoring.utils.js to break circular dependency
let monitoringUtils = null;

// Constants for error handling
const NETWORK_ERROR_CODES = ['EFATAL', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENETUNREACH'];
const CONNECTION_TIMEOUT = 5000; // 5 seconds timeout for connection attempts
const MAX_RETRIES = 1; // Maximum number of retries for sending messages

class TelegramMonitor {
  constructor(token, chatId) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID;
    this.statsInterval = null;
    this.lastConnectionStatus = null;
    this.connectionDownSince = null;
    
    if (!this.token || !this.chatId) {
      logger.warn('Missing token or chatId. Telegram notifications will not be sent.');
      this.enabled = false;
      return;
    }
    
    try {
      // Set request options with timeout to prevent hanging on network issues
      const options = { 
        polling: false, 
        request: {
          timeout: CONNECTION_TIMEOUT
        }
      };
      
      this.bot = new TelegramBot(this.token, options);
      this.enabled = true;
      logger.info('Initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize:', error);
      this.enabled = false;
    }
  }

  /**
   * Check if Internet connection is available by resolving a DNS
   * @returns {Promise<boolean>} True if connection is available
   */
  async checkInternetConnection() {
    try {
      await dns.lookup('api.telegram.org');
      
      // If previously down, log recovery
      if (this.lastConnectionStatus === false) {
        const downtime = this.connectionDownSince 
          ? `(down for ${formatUptime((Date.now() - this.connectionDownSince)/1000)})`
          : '';
        logger.info(`Internet connection restored ${downtime}`);
      }
      
      this.lastConnectionStatus = true;
      this.connectionDownSince = null;
      return true;
    } catch (error) {
      // Only log the first occurrence of connection down
      if (this.lastConnectionStatus !== false) {
        logger.warn(`No internet connection available: ${error.code || error.message}`);
        this.connectionDownSince = this.connectionDownSince || Date.now();
      }
      
      this.lastConnectionStatus = false;
      return false;
    }
  }

  /**
   * Send a message to the configured Telegram chat
   * @param {string} message - Message to send
   * @param {Object} options - Additional options
   * @param {number} options.retryCount - Current retry count (internal use)
   * @returns {Promise<boolean>} - True if message was sent successfully, false otherwise
   */
  async sendMessage(message, options = {}) {
    if (!this.enabled) return false;
    
    // Check internet connection first before attempting to send
    const hasConnection = await this.checkInternetConnection();
    if (!hasConnection) {
      // Skip retry and just return false if no internet
      return false;
    }
    
    const retryCount = options.retryCount || 0;
    
    try {
      const parseMode = options.parseMode || 'Markdown';
      await this.bot.sendMessage(this.chatId, message, { 
        parse_mode: parseMode,
        disable_web_page_preview: true
      });
      return true; // Berhasil mengirim pesan
    } catch (error) {
      // Determine if this is a network error
      const isNetworkError = NETWORK_ERROR_CODES.includes(error.code);
      
      // Log with appropriate level and detail
      if (isNetworkError) {
        logger.warn(`Network error: ${error.code} - Unable to connect to Telegram API`);
      } else {
        // For other errors (e.g. message formatting), log the full error
        logger.error(`Failed to send message: ${error.message}`);
      }
      
      // Try again once for network errors
      if (isNetworkError && retryCount < MAX_RETRIES) {
        logger.info(`Retrying message send (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        return this.sendMessage(message, { ...options, retryCount: retryCount + 1 });
      }
      
      return false; // Gagal mengirim pesan setelah retry
    }
  }

  /**
   * Notify that the server has started
   * @param {Object} options - Server information
   * @param {string} options.version - Application version
   * @param {string} options.environment - Application environment
   * @param {number} options.port - Server port
   * @returns {Promise<boolean>} - True if notification was sent successfully
   */
  async notifyServerStart({ version, environment, port }) {
    const message = `🟢 *Server Started*\n` +
      `Version: ${version || 'N/A'}\n` +
      `Environment: ${environment || 'development'}\n` +
      `Port: ${port || 'N/A'}\n` +
      `Host: ${os.hostname()}\n` +
      `Time: ${new Date().toISOString()}`;
    
    return await this.sendMessage(message);
  }

  /**
   * Notify that the server is stopping
   * @param {string} reason - Reason for server shutdown
   * @returns {Promise<boolean>} - True if notification was sent successfully
   */
  async notifyServerStop(reason = 'Planned shutdown') {
    const uptime = process.uptime();
    const uptimeStr = formatUptime(uptime);
    
    const message = `🔴 *Server Stopping*\n` +
      `Reason: ${reason}\n` +
      `Uptime: ${uptimeStr}\n` +
      `Host: ${os.hostname()}\n` +
      `Time: ${new Date().toISOString()}`;
    
    return await this.sendMessage(message);
  }

  /**
   * Send server statistics
   * @returns {Promise<boolean>} - True if statistics were sent successfully
   */
  async sendServerStats() {
    if (!this.enabled) return false;
    
    try {
      // Lazy load monitoring utils to avoid circular dependency
      if (!monitoringUtils) {
        monitoringUtils = require('./monitoring.utils');
      }
      
      const stats = monitoringUtils.getMonitoringStats();
      const memoryUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsagePercent = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
      
      const uptimeStr = formatUptime(process.uptime());
      const loadAvg = os.loadavg();
      
      // Calculate total requests in the last hour
      const totalRequests = stats.requestsPerMinute.reduce((sum, count) => sum + count, 0);
      
      // Calculate error rate
      const errorCount = Object.entries(stats.statusCodes)
        .filter(([code]) => parseInt(code) >= 500)
        .reduce((sum, [_, count]) => sum + count, 0);
      
      const totalResponses = Object.values(stats.statusCodes).reduce((sum, count) => sum + count, 0);
      const errorRate = totalResponses > 0 ? (errorCount / totalResponses * 100).toFixed(2) : '0.00';
      
      const message = `📊 *Server Statistics*\n` +
        `Uptime: ${uptimeStr}\n` +
        `Memory: ${formatBytes(memoryUsage.rss)} / ${formatBytes(totalMem)} (${memUsagePercent}%)\n` +
        `CPU Load: ${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}\n` +
        `Heap: ${formatBytes(memoryUsage.heapUsed)} / ${formatBytes(memoryUsage.heapTotal)}\n\n` +
        `📈 *Traffic*\n` +
        `Requests (last hour): ${totalRequests}\n` +
        `Requests/min (avg): ${(totalRequests / Math.min(60, stats.requestsPerMinute.length)).toFixed(2)}\n` +
        `Error rate: ${errorRate}%\n` +
        `Active routes: ${Object.keys(stats.statusCodes).length}\n` +
        `Time: ${new Date().toISOString()}`;
      
      return await this.sendMessage(message);
    } catch (error) {
      logger.error('Failed to generate stats:', error);
      return false;
    }
  }

  /**
   * Report an error to Telegram
   * @param {Error} error - The error object
   * @param {Object} context - Additional context information
   * @returns {Promise<boolean>} - True if error was reported successfully, false otherwise
   */
  async reportError(error, context = {}) {
    if (!this.enabled) return false;
    
    // Check internet connection first to fail fast
    const hasConnection = await this.checkInternetConnection();
    if (!hasConnection) {
      return false;
    }
    
    try {
      // Sanitize error message - escape special Markdown characters to avoid parsing issues
      const errorMessage = error.stack || error.message || String(error);
      
      // Remove excessive details from stack trace to make message shorter and avoid parsing issues
      let sanitizedError = errorMessage
        .substring(0, 800) // Telegram has message length limits
        .replace(/\\/g, '/') // Replace Windows backslashes with forward slashes
        .trim();
        
      // Prepare context information for consistent display
      let contextStr = '';
      if (Object.keys(context).length > 0) {
        const sanitizedContext = {};
        
        // Sanitize context keys and values
        for (const [key, value] of Object.entries(context)) {
          // Skip stack trace in context to avoid Markdown parsing issues
          if (key === 'stack') continue;
          
          // Truncate and sanitize object values
          let sanitizedValue;
          if (typeof value === 'object' && value !== null) {
            try {
              // Keep only essential info and stringify
              const simplified = {};
              Object.keys(value).slice(0, 5).forEach(k => {
                let v = value[k];
                if (typeof v === 'string') v = v.substring(0, 50);
                simplified[k] = v;
              });
              sanitizedValue = JSON.stringify(simplified);
            } catch (e) {
              sanitizedValue = '[Complex Object]';
            }
          } else if (typeof value === 'string') {
            // Truncate long strings
            sanitizedValue = value.substring(0, 50);
          } else {
            sanitizedValue = String(value);
          }
          
          sanitizedContext[key] = sanitizedValue;
        }
        
        // Build context string with consistent formatting for HTML mode
        contextStr = '\n\n<b>Error Context:</b>\n' + 
          Object.entries(sanitizedContext)
            .map(([key, value]) => `• ${key}: ${value}`)
            .join('\n');
      }

      // Format error untuk Telegram dengan format yang konsisten
      const errorTitle = error.message || 'Unknown error';
      
      // Switch to HTML mode for better error formatting and to avoid Markdown parsing issues
      const message = `⚠️ <b>Error Detected</b>\n` +
        `<b>Time:</b> ${new Date().toISOString()}\n` +
        `<b>Host:</b> ${os.hostname()}\n` +
        `<b>Error:</b> ${errorTitle}\n\n` +
        `<pre>${sanitizedError}</pre>${contextStr}`;
      
      // Use HTML parsing mode instead of Markdown
      return await this.sendMessage(message, { parseMode: 'HTML' });
    } catch (sendErr) {
      // Check if it's a network error
      const isNetworkError = NETWORK_ERROR_CODES.includes(sendErr.code);
      
      if (isNetworkError) {
        logger.warn(`Network error: ${sendErr.code} - Unable to connect to Telegram API when reporting error`);
      } else {
        logger.error(`Failed to format and send error: ${sendErr}`);
      }
      
      // Try with a simpler message if the formatted one fails and it's not a network error
      try {
        if (!isNetworkError) {
          const simpleMessage = `⚠️ Error detected: ${error.message || 'Unknown error'}\n` +
            `Time: ${new Date().toISOString()}\n` +
            `Host: ${os.hostname()}`;
            
          return await this.sendMessage(simpleMessage);
        }
        return false;
      } catch (e) {
        logger.error(`Also failed to send simplified error message: ${e}`);
        return false;
      }
    }
  }

  /**
   * Start periodic statistics reporting
   * @param {number} intervalMs - Interval in milliseconds
   */
  startPeriodicStats(intervalMs = 3600000) { // Default: hourly
    if (!this.enabled) return;
    
    // Clear any existing interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    
    this.statsInterval = setInterval(() => {
      this.sendServerStats().catch(err => {
        // Jangan log network errors dengan stack trace panjang
        if (NETWORK_ERROR_CODES.includes(err.code)) {
          logger.warn(`Network error during periodic stats: ${err.code}`);
        } else {
          logger.error(`Error during periodic stats: ${err}`);
        }
      });
    }, intervalMs);
    
    logger.info(`Periodic stats enabled (every ${intervalMs / 1000 / 60} minutes)`);
  }

  /**
   * Stop periodic statistics reporting
   */
  stopPeriodicStats() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
      logger.info('Periodic stats disabled');
    }
  }
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format uptime to human-readable string
 * @param {number} uptime - Uptime in seconds
 * @returns {string} Formatted string
 */
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

// Export singleton instance and class
let instance = null;

module.exports = {
  /**
   * Initialize the Telegram monitor
   * @param {Object} options - Configuration options
   * @param {string} options.token - Telegram bot token
   * @param {string} options.chatId - Telegram chat ID
   * @returns {TelegramMonitor} Telegram monitor instance
   */
  init: (options = {}) => {
    instance = new TelegramMonitor(options.token, options.chatId);
    
    // Replace local logger with real logger after initialization to break circular dependency
    try {
      const loggerUtils = require('./logger.utils');
      if (loggerUtils && loggerUtils.logger) {
        logger = loggerUtils.logger;
      }
    } catch (err) {
      console.warn(`${new Date().toISOString()} : [warn] : Could not load logger: ${err.message}`);
    }
    
    return instance;
  },
  
  /**
   * Get the current instance
   * @returns {TelegramMonitor|null} Current instance or null if not initialized
   */
  getInstance: () => instance,
  
  // Export the class for testing/extension
  TelegramMonitor
};