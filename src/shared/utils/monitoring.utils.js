/**
 * Monitoring Utilities
 * Tools for monitoring application health, detecting unusual traffic patterns,
 * and alerting about potential security issues
 */

const TelegramBot = require('node-telegram-bot-api');
const os = require('os');
const { logger } = require('./logger.utils');

// Request tracking
const requestStats = {
  // Track requests per minute
  requestsPerMinute: [],
  // Track requests by status code
  statusCodes: {},
  // Track errors
  errors: [],
  // Last time stats were reset
  lastReset: Date.now(),
  // Current minute bucket
  currentMinute: Math.floor(Date.now() / 60000),
  // Track unique visitors (based on IP)
  visitors: {
    daily: new Map(),   // IP -> first visit timestamp (daily)
    weekly: new Map(),  // IP -> first visit timestamp (weekly)
    monthly: new Map(), // IP -> first visit timestamp (monthly)
    lastReset: {
      daily: Date.now(),
      weekly: Date.now(),
      monthly: Date.now()
    }
  }
};

// Configure alert thresholds
const alertThresholds = {
  requestsPerMinute: 500, // Alert if more than 500 requests in a minute
  errorRatePercent: 10,   // Alert if error rate exceeds 10%
  notFoundPercent: 20,    // Alert if 404 rate exceeds 20%
  consecutiveErrors: 10   // Alert after 10 consecutive errors
};

// Store contact information for alerts
let alertContacts = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID',
  webhooks: process.env.ALERT_WEBHOOKS ? process.env.ALERT_WEBHOOKS.split(',') : []
};

// Initialize Telegram bot
const bot = new TelegramBot(alertContacts.telegramToken, { polling: false });

// Schedule for sending periodic statistics (in milliseconds)
const STATS_INTERVAL = 3600000; // Default: send stats every hour

// Track if we're currently in an alert state to avoid alert flooding
const alertState = {
  highTraffic: false,
  highErrorRate: false,
  high404Rate: false,
  consecutiveErrors: false,
  lastAlertTime: {}
};

/**
 * Record a request in the monitoring system
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
const recordRequest = (req, res, responseTime) => {
  const statusCode = res.statusCode;
  const currentTime = Date.now();
  const currentMinute = Math.floor(currentTime / 60000);
  
  // If we're in a new minute, shift the arrays
  if (currentMinute !== requestStats.currentMinute) {
    requestStats.requestsPerMinute.unshift(0);
    // Keep only last 60 minutes
    if (requestStats.requestsPerMinute.length > 60) {
      requestStats.requestsPerMinute.pop();
    }
    requestStats.currentMinute = currentMinute;
  }
  
  // Increment current minute count
  requestStats.requestsPerMinute[0]++;
  
  // Track by status code
  requestStats.statusCodes[statusCode] = (requestStats.statusCodes[statusCode] || 0) + 1;
  
  // Track unique visitors
  const visitorIP = req.ip || req.connection.remoteAddress;
  
  // Skip internal/monitoring requests and known bots
  const skipIP = /^::1$|^127\.0\.0\.1$/.test(visitorIP);
  const isBot = req.headers['user-agent'] && (
    req.headers['user-agent'].toLowerCase().includes('bot') ||
    req.headers['user-agent'].toLowerCase().includes('crawler') ||
    req.headers['user-agent'].toLowerCase().includes('spider')
  );
  
  if (!skipIP && !isBot) {
    // Track daily visitors
    if (!requestStats.visitors.daily.has(visitorIP)) {
      requestStats.visitors.daily.set(visitorIP, currentTime);
    }
    
    // Track weekly visitors
    if (!requestStats.visitors.weekly.has(visitorIP)) {
      requestStats.visitors.weekly.set(visitorIP, currentTime);
    }
    
    // Track monthly visitors
    if (!requestStats.visitors.monthly.has(visitorIP)) {
      requestStats.visitors.monthly.set(visitorIP, currentTime);
    }
  }
  
  // Track errors
  if (statusCode >= 500) {
    requestStats.errors.push({
      timestamp: currentTime,
      method: req.method,
      path: req.path,
      statusCode,
      ip: req.ip || req.connection.remoteAddress,
      responseTime
    });
    
    // Keep only last 100 errors
    if (requestStats.errors.length > 100) {
      requestStats.errors.shift();
    }
  }
  
  // Check for unusual patterns and reset stats if needed
  if (currentTime - requestStats.lastReset > 60000) {
    checkUnusualPatterns();
    resetPeriodicStats();
  }
};

/**
 * Reset periodic statistics
 */
const resetPeriodicStats = () => {
  const now = Date.now();
  
  // Reset hourly stats
  if (now - requestStats.lastReset >= 3600000) {
    // Reset status code counts
    requestStats.statusCodes = {};
    requestStats.lastReset = now;
    logger.info(`Hourly stats reset`);
  }
  
  // Reset daily visitor stats
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (now - requestStats.visitors.lastReset.daily >= oneDayMs) {
    requestStats.visitors.daily.clear();
    requestStats.visitors.lastReset.daily = now;
    logger.info(`Daily visitor stats reset`);
  }
  
  // Reset weekly visitor stats
  const oneWeekMs = 7 * oneDayMs;
  if (now - requestStats.visitors.lastReset.weekly >= oneWeekMs) {
    requestStats.visitors.weekly.clear();
    requestStats.visitors.lastReset.weekly = now;
    logger.info(`Weekly visitor stats reset`);
  }
  
  // Reset monthly visitor stats
  const thirtyDaysMs = 30 * oneDayMs;
  if (now - requestStats.visitors.lastReset.monthly >= thirtyDaysMs) {
    requestStats.visitors.monthly.clear();
    requestStats.visitors.lastReset.monthly = now;
    logger.info(`Monthly visitor stats reset`);
  }
};

/**
 * Reset hourly statistics
 * @deprecated Use resetPeriodicStats instead
 */
const resetHourlyStats = resetPeriodicStats;

/**
 * Check for unusual traffic patterns
 */
const checkUnusualPatterns = () => {
  const currentRequests = requestStats.requestsPerMinute[0] || 0;
  let averageRequests = 0;
  
  // Calculate average requests per minute (excluding current minute and ignoring zeros)
  if (requestStats.requestsPerMinute.length > 1) {
    const nonZeroMinutes = requestStats.requestsPerMinute.slice(1).filter(count => count > 0);
    if (nonZeroMinutes.length > 0) {
      averageRequests = nonZeroMinutes.reduce((sum, count) => sum + count, 0) / nonZeroMinutes.length;
    }
  }
  
  // Calculate error and 404 rates
  const totalRequests = Object.values(requestStats.statusCodes).reduce((sum, count) => sum + count, 0);
  const errorCount = Object.entries(requestStats.statusCodes)
    .filter(([code]) => parseInt(code) >= 500)
    .reduce((sum, [_, count]) => sum + count, 0);
  
  const notFoundCount = requestStats.statusCodes[404] || 0;
  const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
  const notFoundRate = totalRequests > 0 ? (notFoundCount / totalRequests) * 100 : 0;
  
  // Check for unusual traffic
  if (!alertState.highTraffic && currentRequests > alertThresholds.requestsPerMinute && 
      currentRequests > averageRequests * 2) {
    alertState.highTraffic = true;
    sendAlert('High Traffic Alert', 
      `Unusual traffic detected: ${currentRequests} requests in the last minute. ` +
      `Average is ${averageRequests.toFixed(2)} requests per minute.`);
  } 
  // Reset alert state if traffic returns to normal
  else if (alertState.highTraffic && currentRequests < alertThresholds.requestsPerMinute && 
          currentRequests < averageRequests * 1.5) {
    alertState.highTraffic = false;
    sendAlert('Traffic Returned to Normal', 
      `Traffic has returned to normal levels: ${currentRequests} requests in the last minute.`);
  }
  
  // Check for high error rate
  if (!alertState.highErrorRate && errorRate > alertThresholds.errorRatePercent) {
    alertState.highErrorRate = true;
    sendAlert('High Error Rate Alert', 
      `High error rate detected: ${errorRate.toFixed(2)}% of requests are resulting in 5xx errors.`);
  }
  // Reset alert state if error rate returns to normal
  else if (alertState.highErrorRate && errorRate < alertThresholds.errorRatePercent / 2) {
    alertState.highErrorRate = false;
    sendAlert('Error Rate Returned to Normal', 
      `Error rate has returned to normal: ${errorRate.toFixed(2)}%.`);
  }
  
  // Check for high 404 rate (might indicate scanning attack)
  if (!alertState.high404Rate && notFoundRate > alertThresholds.notFoundPercent) {
    alertState.high404Rate = true;
    sendAlert('High 404 Rate Alert', 
      `High 404 rate detected: ${notFoundRate.toFixed(2)}% of requests are resulting in 404 errors. ` +
      `This may indicate a scanning attack.`);
  }
  // Reset alert state if 404 rate returns to normal
  else if (alertState.high404Rate && notFoundRate < alertThresholds.notFoundPercent / 2) {
    alertState.high404Rate = false;
    sendAlert('404 Rate Returned to Normal', 
      `404 rate has returned to normal: ${notFoundRate.toFixed(2)}%.`);
  }
  
  // Check for consecutive errors
  if (requestStats.errors.length >= alertThresholds.consecutiveErrors) {
    // Get last N errors where N is the threshold
    const recentErrors = requestStats.errors.slice(-alertThresholds.consecutiveErrors);
    
    // If all recent errors happened within 1 minute, send alert
    const oldestError = recentErrors[0].timestamp;
    const newestError = recentErrors[recentErrors.length - 1].timestamp;
    
    if (!alertState.consecutiveErrors && (newestError - oldestError < 60000)) {
      alertState.consecutiveErrors = true;
      
      // Group errors by path for more informative reporting
      const errorsByPath = recentErrors.reduce((acc, error) => {
        acc[error.path] = (acc[error.path] || 0) + 1;
        return acc;
      }, {});
      
      const errorPaths = Object.entries(errorsByPath)
        .map(([path, count]) => `${path} (${count} errors)`)
        .join(', ');
      
      sendAlert('Consecutive Errors Alert',
        `${alertThresholds.consecutiveErrors} consecutive errors detected in less than a minute. ` +
        `Affected endpoints: ${errorPaths}.`);
    }
  } else {
    alertState.consecutiveErrors = false;
  }
};

/**
 * Send an alert through configured channels
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 */
const sendAlert = (title, message) => {
  const now = Date.now();
  const alertType = title.toLowerCase().replace(/\s+/g, '_');
  
  // Prevent alert flooding - only send each type of alert once every 5 minutes
  if (alertState.lastAlertTime[alertType] && (now - alertState.lastAlertTime[alertType] < 5 * 60 * 1000)) {
    return;
  }
  
  // Record this alert time
  alertState.lastAlertTime[alertType] = now;
  
  // Log the alert using standardized logger
  logger.warn(`${title}: ${message}`, { type: 'alert', alertType });
  
  // Send Telegram alert
  bot.sendMessage(alertContacts.telegramChatId, `🚨 *${title}*\n${message}`).catch(err => {
    logger.error(`Failed to send Telegram alert: ${err.message}`, { error: err });
  });
  
  // Example webhook notifications (commented out)
  /*
  const axios = require('axios');
  
  alertContacts.webhooks.forEach(webhook => {
    axios.post(webhook, {
      title,
      message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }).catch(err => {
      logger.error(`Failed to send webhook alert to ${webhook}: ${err.message}`, { error: err });
    });
  });
  */
};

/**
 * Update alert contact information
 * @param {Object} contacts - New contact information
 */
const updateAlertContacts = (contacts) => {
  if (contacts.telegramToken) {
    alertContacts.telegramToken = contacts.telegramToken;
  }
  
  if (contacts.telegramChatId) {
    alertContacts.telegramChatId = contacts.telegramChatId;
  }
  
  if (contacts.webhooks) {
    alertContacts.webhooks = contacts.webhooks;
  }
  
  return { ...alertContacts };
};

/**
 * Get current monitoring statistics
 * @returns {Object} Current monitoring statistics
 */
const getMonitoringStats = () => {
  // Create a copy to avoid external modification
  return {
    requestsPerMinute: [...requestStats.requestsPerMinute],
    statusCodes: { ...requestStats.statusCodes },
    errorCount: requestStats.errors.length,
    alertState: { ...alertState },
    uptime: process.uptime(),
    visitors: {
      daily: requestStats.visitors.daily.size,
      weekly: requestStats.visitors.weekly.size,
      monthly: requestStats.visitors.monthly.size
    }
  };
};

/**
 * Get detailed visitor statistics
 * @returns {Object} Visitor statistics
 */
const getVisitorStats = () => {
  // For security reasons, we don't expose the actual IPs
  return {
    uniqueVisitors: {
      daily: requestStats.visitors.daily.size,
      weekly: requestStats.visitors.weekly.size,
      monthly: requestStats.visitors.monthly.size
    },
    lastReset: {
      daily: new Date(requestStats.visitors.lastReset.daily).toISOString(),
      weekly: new Date(requestStats.visitors.lastReset.weekly).toISOString(),
      monthly: new Date(requestStats.visitors.lastReset.monthly).toISOString()
    }
  };
};

/**
 * Monitoring middleware to track all requests
 */
const monitoringMiddleware = (req, res, next) => {
  // Record request start time
  req.startTime = Date.now();
  
  // Hook into response to capture end time and status code
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - req.startTime;
    
    // Record the request after it completes
    recordRequest(req, res, responseTime);
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  monitoringMiddleware,
  getMonitoringStats,
  getVisitorStats,
  updateAlertContacts,
  // Export for testing
  recordRequest,
  checkUnusualPatterns,
  resetPeriodicStats,
  resetHourlyStats
};