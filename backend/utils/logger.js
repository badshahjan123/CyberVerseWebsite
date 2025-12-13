/**
 * Logger Utility
 * Provides environment-aware logging with different levels
 * In production, it minimizes console output for better performance
 */

const { ENV } = require('../config/constants');

// ANSI color codes for better visibility in development
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

// Determine current environment
const isDevelopment = process.env.NODE_ENV === ENV.DEVELOPMENT;
const isProduction = process.env.NODE_ENV === ENV.PRODUCTION;

/**
 * Format log message with timestamp and color
 */
const formatMessage = (level, message, color) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    if (isDevelopment) {
        return `${color}${prefix}${colors.reset} ${message}`;
    }
    return `${prefix} ${message}`;
};

/**
 * Logger object with different logging levels
 */
const logger = {
    /**
     * Debug - Detailed information for diagnosing problems
     * Only shown in development
     */
    debug: (message, ...args) => {
        if (isDevelopment) {
            console.log(formatMessage('DEBUG', message, colors.dim), ...args);
        }
    },

    /**
     * Info  - General informational messages
     * Shown in development and production
     */
    info: (message, ...args) => {
        console.log(formatMessage('INFO', message, colors.cyan), ...args);
    },

    /**
     * Success - Success messages
     * Shown in development and production
     */
    success: (message, ...args) => {
        console.log(formatMessage('SUCCESS', message, colors.green), ...args);
    },

    /**
     * Warn - Warning messages for potential issues
     * Always shown
     */
    warn: (message, ...args) => {
        console.warn(formatMessage('WARN', message, colors.yellow), ...args);
    },

    /**
     * Error - Error messages
     * Always shown
     */
    error: (message, ...args) => {
        console.error(formatMessage('ERROR', message, colors.red), ...args);
    },

    /**
     * API - API-specific logging
     * Only shown in development
     */
    api: (method, endpoint, status, message = '') => {
        if (isDevelopment) {
            const statusColor = status < 400 ? colors.green : colors.red;
            console.log(
                `${colors.magenta}[API]${colors.reset} ${method} ${endpoint} ` +
                `${statusColor}${status}${colors.reset} ${message}`
            );
        }
    },

    /**
     * Socket - WebSocket logging
     * Only shown in development
     */
    socket: (event, message, ...args) => {
        if (isDevelopment) {
            console.log(
                `${colors.blue}[SOCKET]${colors.reset} ${event}: ${message}`,
                ...args
            );
        }
    },

    /**
     * DB - Database logging
     * Only shown in development
     */
    db: (operation, message, ...args) => {
        if (isDevelopment) {
            console.log(
                `${colors.yellow}[DB]${colors.reset} ${operation}: ${message}`,
                ...args
            );
        }
    },

    /**
     * Auth - Authentication/Authorization logging
     * Shown in development and production (security)
     */
    auth: (message, ...args) => {
        console.log(formatMessage('AUTH', message, colors.magenta), ...args);
    },

    /**
     * Performance - Performance metrics
     * Only shown in development
     */
    perf: (operation, duration) => {
        if (isDevelopment) {
            const color = duration < 100 ? colors.green : duration < 500 ? colors.yellow : colors.red;
            console.log(`${colors.cyan}[PERF]${colors.reset} ${operation}: ${color}${duration}ms${colors.reset}`);
        }
    },

    /**
     * Separator - Visual separator for logs
     * Only in development
     */
    separator: () => {
        if (isDevelopment) {
            console.log(colors.dim + '─'.repeat(80) + colors.reset);
        }
    },
};

/**
 * Request logger middleware
 * Logs all incoming HTTP requests in development
 */
logger.requestMiddleware = (req, res, next) => {
    if (isDevelopment) {
        const start = Date.now();

        // Log when response finishes
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.api(req.method, req.originalUrl, res.statusCode, `${duration}ms`);
        });
    }
    next();
};

/**
 * Error logger middleware
 * Logs errors with stack trace
 */
logger.errorMiddleware = (err, req, res, next) => {
    // Always log errors
    logger.error(`${err.message}`, {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        stack: isDevelopment ? err.stack : undefined,
    });

    next(err);
};

module.exports = logger;
