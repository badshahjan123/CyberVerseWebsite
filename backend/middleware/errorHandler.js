const logger = require('../utils/logger');
const { HTTP_STATUS, MESSAGES } = require('../config/constants');

// Custom error class for better error handling
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Main error handler - catches all errors
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    statusCode = statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = message || MESSAGES.SERVER_ERROR;

    // Log errors with different levels
    if (statusCode >= 500) {
        logger.error(`${req.method} ${req.path}`, {
            error: message,
            stack: err.stack,
            statusCode
        });
    } else {
        logger.warn(`${req.method} ${req.path}`, {
            error: message,
            statusCode
        });
    }

    const response = {
        success: false,
        message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    res.status(statusCode).json(response);
};

// 404 handler for routes that don't exist
const notFound = (req, res, next) => {
    const error = new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Route not found: ${req.method} ${req.originalUrl}`
    );
    next(error);
};

// Converts any error to ApiError format
const errorConverter = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message = error.message || MESSAGES.SERVER_ERROR;
        error = new ApiError(statusCode, message, false, err.stack);
    }

    next(error);
};

module.exports = {
    ApiError,
    errorHandler,
    notFound,
    errorConverter
};
