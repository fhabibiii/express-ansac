/**
 * IP Blacklisting Middleware
 * Blocks IPs that have been blacklisted due to suspicious activity
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config/app.config');
const { logger } = require('../utils/logger.utils');

// File path for persistent storage
const blacklistFilePath = path.join(__dirname, '../../../data/blacklist.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    logger.error('Failed to create data directory for blacklist:', { error: err });
  }
}

// Check if we're in development mode
const isDevelopment = config.app.environment === 'development';

// In-memory blacklist storage with persistence
const blacklist = {
  ips: {},
  lastCleanup: Date.now(),
  
  // Load blacklist from file
  load: function() {
    // Skip loading blacklist in development mode
    if (isDevelopment) {
      logger.info('Development mode: Blacklist is disabled', { component: 'Security' });
      return;
    }
    
    try {
      if (fs.existsSync(blacklistFilePath)) {
        const data = fs.readFileSync(blacklistFilePath, 'utf8');
        
        // Check if file is empty or contains invalid JSON
        if (!data || data.trim() === '') {
          // Initialize with empty data if file is empty
          this.ips = {};
          // Create a valid empty blacklist file
          this.save();
          logger.info('Created new empty blacklist file', { component: 'Security' });
          return;
        }
        
        // Try to parse the JSON data
        const loadedData = JSON.parse(data);
        
        // Only keep non-expired entries
        const now = Date.now();
        Object.entries(loadedData.ips || {}).forEach(([ip, entry]) => {
          if (entry.expiresAt > now) {
            this.ips[ip] = entry;
          }
        });
        
        logger.info(`Loaded ${Object.keys(this.ips).length} blacklisted IPs from storage`, { component: 'Security' });
      } else {
        // Create empty blacklist file if it doesn't exist
        this.save();
        logger.info('Created new blacklist file', { component: 'Security' });
      }
    } catch (err) {
      logger.error('Failed to load blacklist from file:', { error: err, component: 'Security' });
      // Initialize with empty data on error
      this.ips = {};
      // Create a valid blacklist file to prevent future errors
      this.save();
    }
  },
  
  // Save blacklist to file
  save: function() {
    // Skip saving blacklist in development mode
    if (isDevelopment) {
      return;
    }
    
    try {
      const dataToSave = {
        ips: this.ips,
        savedAt: Date.now()
      };
      
      fs.writeFileSync(blacklistFilePath, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save blacklist to file:', { error: err, component: 'Security' });
    }
  }
};

// Load blacklist on startup
blacklist.load();

/**
 * Add an IP to the blacklist
 * @param {string} ip - The IP address to blacklist
 * @param {Object} options - Blacklisting options
 * @param {string} options.reason - Reason for blacklisting
 * @param {number} options.duration - Duration in milliseconds to blacklist
 * @param {number} [options.timestamp=Date.now()] - When the blacklisting started
 */
const addToBlacklist = (ip, options) => {
  // Skip blacklisting in development mode
  if (isDevelopment) {
    logger.info(`Development mode: Not blacklisting IP ${ip} (${options.reason})`, { component: 'Security', ip });
    return;
  }
  
  const { reason, duration, timestamp = Date.now() } = options;
  
  blacklist.ips[ip] = {
    reason,
    expiresAt: timestamp + duration,
    blacklistedAt: timestamp
  };
  
  logger.warn(`IP ${ip} has been blacklisted for ${reason} until ${new Date(timestamp + duration).toISOString()}`, { 
    component: 'Security',
    ip,
    reason,
    expiresAt: new Date(timestamp + duration).toISOString()
  });
  
  // Save blacklist to file after adding new entry
  blacklist.save();
};

/**
 * Check if an IP is blacklisted
 * @param {string} ip - The IP address to check
 * @returns {boolean} Whether the IP is blacklisted
 */
const isBlacklisted = (ip) => {
  // Skip blacklist check in development mode
  if (isDevelopment) {
    return false;
  }
  
  if (!blacklist.ips[ip]) {
    return false;
  }
  
  const now = Date.now();
  
  // If blacklist entry has expired, remove it
  if (now > blacklist.ips[ip].expiresAt) {
    delete blacklist.ips[ip];
    // Save changes to file
    blacklist.save();
    return false;
  }
  
  return true;
};

/**
 * Clean up expired blacklist entries
 */
const cleanupBlacklist = () => {
  // Skip cleanup in development mode
  if (isDevelopment) {
    return;
  }
  
  const now = Date.now();
  
  // Only clean up once per hour
  if (now - blacklist.lastCleanup < 3600000) {
    return;
  }
  
  logger.info('Cleaning up expired IP blacklist entries', { component: 'Security' });
  
  let removedCount = 0;
  // Remove expired entries
  for (const [ip, entry] of Object.entries(blacklist.ips)) {
    if (now > entry.expiresAt) {
      delete blacklist.ips[ip];
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    logger.info(`Removed ${removedCount} expired IP(s) from blacklist`, { component: 'Security', removedCount });
    // Save changes to file
    blacklist.save();
  }
  
  blacklist.lastCleanup = now;
};

/**
 * Middleware to block blacklisted IPs
 */
const blacklistMiddleware = (req, res, next) => {
  // Skip blacklist middleware in development mode
  if (isDevelopment) {
    return next();
  }
  
  const ip = req.ip || req.connection.remoteAddress;
  
  // Clean up expired entries occasionally
  cleanupBlacklist();
  
  // Check if the IP is blacklisted
  if (isBlacklisted(ip)) {
    logger.warn(`Blocked request from blacklisted IP: ${ip}`, { component: 'Security', ip });
    
    // Return a 403 Forbidden response
    return res.status(403).json({
      success: false,
      message: 'Access denied due to suspicious activity',
      error: {
        code: 403,
        reason: 'IP address temporarily blacklisted'
      }
    });
  }
  
  // If not blacklisted, continue
  next();
};

module.exports = {
  blacklistMiddleware,
  addToBlacklist,
  isBlacklisted,
  getBlacklist: () => ({ ...blacklist })
};