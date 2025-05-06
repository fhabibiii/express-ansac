/**
 * Database Backup Utility
 * Automated database backup scheduler
 */

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { logger } = require('../shared/utils/logger.utils');
const os = require('os');

// Pastikan direktori backup ada
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  logger.info(`Created backup directory: ${backupDir}`);
}

// MySQL/MariaDB paths configuration
const dbConfig = {
  // Default mysqldump path (menggunakan path MariaDB yang sudah diketahui)
  defaultPath: 'C:\\Program Files\\MariaDB 11.4\\bin\\mysqldump.exe',
  // Custom path dari environment variable
  customPath: process.env.MYSQLDUMP_PATH
};

/**
 * Find mysqldump executable path
 * @returns {string|null} Path to mysqldump or null if not found
 */
const findMysqldumpPath = () => {
  // Prioritas ke environment variable MYSQLDUMP_PATH
  if (dbConfig.customPath && fs.existsSync(dbConfig.customPath)) {
    logger.info(`Using mysqldump from MYSQLDUMP_PATH: ${dbConfig.customPath}`);
    return dbConfig.customPath;
  }

  // Fallback ke path default MariaDB 11.4
  if (fs.existsSync(dbConfig.defaultPath)) {
    logger.info(`Using default MariaDB mysqldump: ${dbConfig.defaultPath}`);
    return dbConfig.defaultPath;
  }
  
  // Jika di Linux/Mac, coba dari PATH
  if (os.platform() !== 'win32') {
    logger.info('Using mysqldump from system PATH');
    return 'mysqldump';
  }
  
  logger.error('Could not find mysqldump executable');
  return null;
};

// Parsing DATABASE_URL untuk mendapatkan kredensial
const parseDbUrl = () => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Format: mysql://username:password@host:port/database
    // OR: mariadb://username:password@host:port/database
    const regex = /(?:mysql|mariadb):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = url.match(regex);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Should be mysql:// or mariadb:// protocol');
    }

    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5],
      isMariaDB: url.startsWith('mariadb://')
    };
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    return null;
  }
};

/**
 * Fungsi backup database menggunakan mysqldump
 */
const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);
  
  const dbInfo = parseDbUrl();
  if (!dbInfo) {
    logger.error('Cannot perform backup: Database configuration is invalid');
    return;
  }

  // Find mysqldump executable
  const mysqldumpPath = findMysqldumpPath();
  if (!mysqldumpPath) {
    const dbType = dbInfo.isMariaDB ? 'MariaDB' : 'MySQL';
    logger.error(`Cannot perform backup: mysqldump executable not found. 
      Please set MYSQLDUMP_PATH environment variable to point to your mysqldump executable.`);
    
    // Send notification via Telegram if available
    const telegramMonitor = require('../shared/utils/telegram.monitor');
    const monitor = telegramMonitor.getInstance();
    if (monitor) {
      monitor.sendMessage(`⚠️ *Database Backup Failed*\n
      Could not find mysqldump executable for ${dbType}. Please set MYSQLDUMP_PATH in environment variables.`);
    }
    return;
  }

  // Perintah mysqldump dengan path yang benar
  // Using quotes around passwords in case they contain special characters
  let command = `"${mysqldumpPath}" -h ${dbInfo.host} -P ${dbInfo.port} -u ${dbInfo.user} -p"${dbInfo.password}" ${dbInfo.database}`;
  
  // Complete the command with output redirection
  command += ` > "${backupPath}"`;
  
  logger.info(`Starting database backup to ${backupPath}`);
  
  // Use shell option to ensure redirects work on all platforms
  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Database backup failed: ${error.message}`);
      
      // Send notification via Telegram if available
      const telegramMonitor = require('../shared/utils/telegram.monitor');
      const monitor = telegramMonitor.getInstance();
      if (monitor) {
        monitor.sendMessage(`❌ *Database Backup Failed*\nError: ${error.message}`);
      }
      return;
    }
    
    if (stderr) {
      logger.warn(`Database backup warning: ${stderr}`);
    }
    
    // Periksa ukuran file untuk memastikan backup berhasil
    try {
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (stats.size === 0) {
        logger.error('Database backup failed: Generated file is empty');
        fs.unlinkSync(backupPath); // Delete empty file
        
        // Send notification via Telegram if available
        const telegramMonitor = require('../shared/utils/telegram.monitor');
        const monitor = telegramMonitor.getInstance();
        if (monitor) {
          monitor.sendMessage(`❌ *Database Backup Failed*\nGenerated file is empty`);
        }
        return;
      }
      
      const dbType = dbInfo.isMariaDB ? 'MariaDB' : 'MySQL';
      logger.info(`${dbType} database backup completed: ${backupPath} (${fileSizeInMB.toFixed(2)} MB)`);
      
      // Send success notification via Telegram if available
      const telegramMonitor = require('../shared/utils/telegram.monitor');
      const monitor = telegramMonitor.getInstance();
      if (monitor) {
        monitor.sendMessage(`✅ *${dbType} Database Backup Completed*\nFile: ${path.basename(backupPath)}\nSize: ${fileSizeInMB.toFixed(2)} MB`);
      }
      
      // Bersihkan backup lama (simpan 7 backup terakhir saja)
      cleanupOldBackups();
    } catch (error) {
      logger.error(`Error verifying backup file: ${error.message}`);
    }
  });
};

/**
 * Membersihkan backup lama, hanya menyimpan 7 terbaru
 */
const cleanupOldBackups = () => {
  try {
    // Dapatkan semua file backup dan urutkan berdasarkan tanggal (terbaru di awal)
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    // Hapus semua file backup kecuali 7 terbaru
    if (files.length > 7) {
      files.slice(7).forEach(file => {
        fs.unlinkSync(file.path);
        logger.info(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    logger.error(`Failed to cleanup old backups: ${error.message}`);
  }
};

/**
 * Jadwalkan backup database
 * - Backup harian (jam 2 pagi)
 * - Backup mingguan (Minggu jam 3 pagi)
 */
const scheduleBackups = () => {
  // Skip scheduling in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Backup harian (Setiap hari jam 2 pagi)
  cron.schedule('0 2 * * *', () => {
    logger.info('Running daily database backup...');
    backupDatabase();
  });

  // Backup mingguan (Setiap hari Minggu jam 3 pagi)
  cron.schedule('0 3 * * 0', () => {
    logger.info('Running weekly database backup...');
    backupDatabase();
  });

  logger.info('Database backup scheduler initialized');
  
  // Backup saat startup di development (opsional)
  if (process.env.NODE_ENV === 'development' && process.env.INITIAL_BACKUP === 'true') {
    logger.info('Running initial database backup...');
    backupDatabase();
  }
};

module.exports = {
  scheduleBackups,
  backupDatabase,
  cleanupOldBackups,
};