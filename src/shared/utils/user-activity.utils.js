/**
 * User Activity Monitoring
 * Tracks and reports user activity statistics
 */

const telegramMonitor = require('./telegram.monitor');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getVisitorStats } = require('./monitoring.utils');
const { logger } = require('./logger.utils');

// Tracking variables
let userActivityInterval = null;
const ACTIVITY_CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours by default

/**
 * Starts user activity monitoring and reporting
 * @param {number} intervalMs - Interval in milliseconds (default: 12 hours)
 */
const startUserActivityMonitoring = (intervalMs = ACTIVITY_CHECK_INTERVAL) => {
  // Clear any existing interval
  if (userActivityInterval) {
    clearInterval(userActivityInterval);
  }
  
  // Set up periodic check
  userActivityInterval = setInterval(async () => {
    await reportUserActivity();
  }, intervalMs);
  
  logger.info(`Started user activity monitoring (reports every ${intervalMs / (60 * 60 * 1000)} hours)`);
};

/**
 * Stops user activity monitoring
 */
const stopUserActivityMonitoring = () => {
  if (userActivityInterval) {
    clearInterval(userActivityInterval);
    userActivityInterval = null;
    logger.info('Stopped user activity monitoring');
  }
};

/**
 * Generates and reports user activity statistics
 */
const reportUserActivity = async () => {
  try {
    const monitor = telegramMonitor.getInstance();
    if (!monitor || !monitor.enabled) return;
    
    // Get the timestamp for 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get the timestamp for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get the timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Query counts from database
    const totalUsers = await prisma.user.count();
    
    // Get user registrations per period
    const newUsers30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    const newUsers7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    const newUsers24Hours = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });
    
    // Count users with recent test results as a proxy for activity
    const activeTestUsers30Days = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    const activeTestUsers7Days = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    const activeTestUsers24Hours = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    // Count active blog authors as another activity indicator
    const activeBlogAuthors30Days = await prisma.blog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdBy: true
      },
      distinct: ['createdBy']
    });
    
    // Calculate combined activity (unique users across both test takers and blog authors)
    // This provides a reasonable proxy for "active users" without lastLogin field
    const activeUsers30Days = new Set([
      ...activeTestUsers30Days.map(u => u.userId),
      ...activeBlogAuthors30Days.map(u => u.createdBy)
    ]).size;
    
    const activeUsers7Days = new Set([
      ...activeTestUsers7Days.map(u => u.userId),
      ...activeTestUsers7Days.map(u => u.userId)
    ]).size;
    
    const activeUsers24Hours = new Set([
      ...activeTestUsers24Hours.map(u => u.userId),
      ...activeTestUsers24Hours.map(u => u.userId)
    ]).size;
    
    // Calculate rates
    const activeRate30Days = totalUsers > 0 ? ((activeUsers30Days / totalUsers) * 100).toFixed(1) : '0';
    const activeRate7Days = totalUsers > 0 ? ((activeUsers7Days / totalUsers) * 100).toFixed(1) : '0';
    const activeRate24Hours = totalUsers > 0 ? ((activeUsers24Hours / totalUsers) * 100).toFixed(1) : '0';
    
    // Get counts of content
    const totalTests = await prisma.test.count();
    const totalBlogs = await prisma.blog.count();
    const totalGalleries = await prisma.gallery.count();
    
    // Get visitor statistics from monitoring system
    const visitorStats = getVisitorStats();
    
    // Format the message
    const message = `📊 *Statistik Aktivitas Aplikasi*\n\n` +
      `*Pengunjung Unik (Berdasarkan IP):*\n` +
      `• 24 jam terakhir: ${visitorStats.uniqueVisitors.daily}\n` +
      `• 7 hari terakhir: ${visitorStats.uniqueVisitors.weekly}\n` +
      `• 30 hari terakhir: ${visitorStats.uniqueVisitors.monthly}\n\n` +
      `*Total Pengguna Terdaftar:* ${totalUsers}\n\n` +
      `*Pengguna Aktif (Tes & Konten):*\n` +
      `• 24 jam terakhir: ${activeUsers24Hours} (${activeRate24Hours}%)\n` +
      `• 7 hari terakhir: ${activeUsers7Days} (${activeRate7Days}%)\n` +
      `• 30 hari terakhir: ${activeUsers30Days} (${activeRate30Days}%)\n\n` +
      `*Registrasi Baru:*\n` +
      `• 24 jam terakhir: ${newUsers24Hours}\n` +
      `• 7 hari terakhir: ${newUsers7Days}\n` +
      `• 30 hari terakhir: ${newUsers30Days}\n\n` +
      `*Statistik Konten:*\n` +
      `• Total Tes: ${totalTests}\n` +
      `• Total Blog: ${totalBlogs}\n` +
      `• Total Galeri: ${totalGalleries}\n\n` +
      `Waktu: ${new Date().toISOString()}`;
    
    // Send the report and check if it was successful
    const messageSent = await monitor.sendMessage(message);
    
    // Jika pengiriman gagal, log dengan format yang lebih ringkas
    if (!messageSent) {
      logger.info('User activity report generated but not sent due to connection issues');
    }
    
  } catch (error) {
    // Filter error logging for network issues
    if (error.code === 'EFATAL' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      logger.error(`Network error while generating user activity report: ${error.code}`);
    } else {
      logger.error('Failed to generate user activity report:', error);
    }
    
    // Cek koneksi Telegram terlebih dahulu sebelum mencoba melaporkan error
    try {
      const monitor = telegramMonitor.getInstance();
      if (monitor && monitor.enabled) {
        // Jangan laporkan error koneksi ke Telegram untuk mencegah error bersarang
        if (!(error.code === 'EFATAL' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')) {
          const errorReported = await monitor.reportError(error, { context: 'User activity reporting' });
          
          // Jika gagal mengirim laporan error, cukup log di console
          if (!errorReported) {
            logger.info('Could not send error report to Telegram due to connection issues');
          }
        }
      }
    } catch (secondaryError) {
      // Jika terjadi error saat pelaporan error, cukup log di console
      logger.error('Failed to report error to Telegram:', secondaryError);
    }
  }
};

module.exports = {
  startUserActivityMonitoring,
  stopUserActivityMonitoring,
  reportUserActivity
};