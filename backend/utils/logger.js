const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Custom logging methods
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    url: req ? req.url : null,
    method: req ? req.method : null,
    ip: req ? req.ip : null,
    userId: req && req.user ? req.user._id : null
  };
  
  logger.error('Application Error', errorData);
};

logger.logSecurity = (event, req, details = {}) => {
  const securityData = {
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    userId: req.user ? req.user._id : null,
    details
  };
  
  logger.warn('Security Event', securityData);
};

logger.logDatabase = (operation, collection, duration, details = {}) => {
  const dbData = {
    operation,
    collection,
    duration: `${duration}ms`,
    details
  };
  
  logger.debug('Database Operation', dbData);
};

logger.logAuth = (event, userId, success, details = {}) => {
  const authData = {
    event,
    userId,
    success,
    timestamp: new Date().toISOString(),
    details
  };
  
  if (success) {
    logger.info('Authentication Event', authData);
  } else {
    logger.warn('Authentication Failure', authData);
  }
};

logger.logBusiness = (event, userId, details = {}) => {
  const businessData = {
    event,
    userId,
    timestamp: new Date().toISOString(),
    details
  };
  
  logger.info('Business Event', businessData);
};

// Performance monitoring
logger.logPerformance = (operation, duration, details = {}) => {
  const perfData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    details
  };
  
  if (duration > 1000) {
    logger.warn('Slow Operation', perfData);
  } else {
    logger.debug('Performance', perfData);
  }
};

// API usage tracking
logger.logAPIUsage = (endpoint, userId, method, statusCode, duration) => {
  const apiData = {
    endpoint,
    userId,
    method,
    statusCode,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  };
  
  logger.info('API Usage', apiData);
};

// Real-time events
logger.logRealtime = (event, userId, details = {}) => {
  const realtimeData = {
    event,
    userId,
    timestamp: new Date().toISOString(),
    details
  };
  
  logger.info('Real-time Event', realtimeData);
};

// File operations
logger.logFileOperation = (operation, filename, size, userId) => {
  const fileData = {
    operation,
    filename,
    size: `${size} bytes`,
    userId,
    timestamp: new Date().toISOString()
  };
  
  logger.info('File Operation', fileData);
};

// Email operations
logger.logEmail = (event, recipient, subject, success, details = {}) => {
  const emailData = {
    event,
    recipient,
    subject,
    success,
    timestamp: new Date().toISOString(),
    details
  };
  
  if (success) {
    logger.info('Email Event', emailData);
  } else {
    logger.error('Email Failure', emailData);
  }
};

// Cache operations
logger.logCache = (operation, key, hit, duration) => {
  const cacheData = {
    operation,
    key,
    hit,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  };
  
  logger.debug('Cache Operation', cacheData);
};

// System health
logger.logSystemHealth = (component, status, details = {}) => {
  const healthData = {
    component,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  
  if (status === 'healthy') {
    logger.info('System Health', healthData);
  } else {
    logger.error('System Health Issue', healthData);
  }
};

// Export logger instance
module.exports = logger;
