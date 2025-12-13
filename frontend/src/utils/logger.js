/**
 * Frontend Logger Utility
 * Provides environment-aware logging for React application
 * Automatically disabled in production for performance
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logger for frontend with styled console output
 */
const logger = {
    /**
     * Debug - Development only detailed logs
     */
    debug: (message, ...args) => {
        if (isDevelopment) {
            console.log(
                '%c[DEBUG]',
                'color: #gray; font-weight: bold',
                message,
                ...args
            );
        }
    },

    /**
     * Info - General information
     */
    info: (message, ...args) => {
        if (isDevelopment) {
            console.log(
                '%c[INFO]',
                'color: #3b82f6; font-weight: bold',
                message,
                ...args
            );
        }
    },

    /**
     * Success - Success messages
     */
    success: (message, ...args) => {
        if (isDevelopment) {
            console.log(
                '%c[SUCCESS]',
                'color: #10b981; font-weight: bold',
                message,
                ...args
            );
        }
    },

    /**
     * Warning - Warning messages
     */
    warn: (message, ...args) => {
        console.warn(
            '%c[WARN]',
            'color: #f59e0b; font-weight: bold',
            message,
            ...args
        );
    },

    /**
     * Error - Error messages (always shown)
     */
    error: (message, ...args) => {
        console.error(
            '%c[ERROR]',
            'color: #ef4444; font-weight: bold',
            message,
            ...args
        );
    },

    /**
     * API - API call logging
     */
    api: (method, endpoint, data) => {
        if (isDevelopment) {
            console.log(
                '%c[API]',
                'color: #8b5cf6; font-weight: bold',
                `${method} ${endpoint}`,
                data
            );
        }
    },

    /**
     * Component - Component lifecycle logging
     */
    component: (componentName, action, data) => {
        if (isDevelopment) {
            console.log(
                '%c[COMPONENT]',
                'color: #ec4899; font-weight: bold',
                `${componentName} ${action}`,
                data
            );
        }
    },

    /**
     * Socket - WebSocket event logging
     */
    socket: (event, data) => {
        if (isDevelopment) {
            console.log(
                '%c[SOCKET]',
                'color: #14b8a6; font-weight: bold',
                event,
                data
            );
        }
    },

    /**
     * Performance - Performance metrics
     */
    perf: (operation, duration) => {
        if (isDevelopment) {
            const color = duration < 100 ? '#10b981' : duration < 500 ? '#f59e0b' : '#ef4444';
            console.log(
                '%c[PERF]',
                `color: ${color}; font-weight: bold`,
                `${operation}: ${duration}ms`
            );
        }
    },

    /**
     * Group - Start a console group
     */
    group: (label) => {
        if (isDevelopment) {
            console.group(`%c${label}`, 'color: #6366f1; font-weight: bold');
        }
    },

    /**
     * Group End - End a console group
     */
    groupEnd: () => {
        if (isDevelopment) {
            console.groupEnd();
        }
    },

    /**
     * Table - Display data in table format
     */
    table: (data) => {
        if (isDevelopment) {
            console.table(data);
        }
    },
};

/**
 * Performance measurement helper
 */
export const measurePerformance = (operation, callback) => {
    if (!isDevelopment) {
        return callback();
    }

    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;

    logger.perf(operation, Math.round(duration));

    return result;
};

/**
 * Async performance measurement helper
 */
export const measurePerformanceAsync = async (operation, callback) => {
    if (!isDevelopment) {
        return await callback();
    }

    const start = performance.now();
    const result = await callback();
    const duration = performance.now() - start;

    logger.perf(operation, Math.round(duration));

    return result;
};

export default logger;
