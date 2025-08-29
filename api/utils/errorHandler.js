/**
 * Standardized Error Handling Utilities
 * This module provides consistent error responses and status codes across the application
 */

/**
 * Standard error response format
 * @param {string} message - Human readable error message
 * @param {any} details - Additional technical details (optional)
 * @param {string} code - Error code for frontend handling (optional)
 * @returns {object} Standardized error response object
 */
function createErrorResponse(message, details = null, code = null) {
    const response = {
        error: message
    };
    
    if (details !== null) {
        response.details = details;
    }
    
    if (code !== null) {
        response.code = code;
    }
    
    return response;
}

/**
 * HTTP Status Code Constants
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Error types and their corresponding status codes
 */
const ERROR_TYPES = {
    VALIDATION_ERROR: {
        status: HTTP_STATUS.BAD_REQUEST,
        code: 'VALIDATION_ERROR'
    },
    NOT_FOUND: {
        status: HTTP_STATUS.NOT_FOUND,
        code: 'NOT_FOUND'
    },
    UNAUTHORIZED: {
        status: HTTP_STATUS.UNAUTHORIZED,
        code: 'UNAUTHORIZED'
    },
    FORBIDDEN: {
        status: HTTP_STATUS.FORBIDDEN,
        code: 'FORBIDDEN'
    },
    DUPLICATE_ENTRY: {
        status: HTTP_STATUS.CONFLICT,
        code: 'DUPLICATE_ENTRY'
    },
    DATABASE_ERROR: {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: 'DATABASE_ERROR'
    },
    INTERNAL_ERROR: {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR'
    }
};

/**
 * Enhanced error logging with context
 * @param {string} operation - The operation being performed
 * @param {Error} error - The error object
 * @param {object} context - Additional context (userId, requestId, etc.)
 */
function logError(operation, error, context = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        operation,
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        context
    };
    
    console.error(`[${timestamp}] ${operation} failed:`, JSON.stringify(logData, null, 2));
}

/**
 * Handle validation errors from express-validator
 * @param {object} errors - Validation errors from express-validator
 * @returns {object} Standardized error response
 */
function handleValidationErrors(errors) {
    const validationDetails = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
    }));
    
    return createErrorResponse(
        'Validation failed',
        validationDetails,
        ERROR_TYPES.VALIDATION_ERROR.code
    );
}

/**
 * Determine error type and status code based on error characteristics
 * @param {Error} error - The error object
 * @returns {object} Error type configuration
 */
function determineErrorType(error) {
    // Database-specific errors
    if (error.code) {
        switch (error.code) {
            case '23505': // PostgreSQL unique violation
                return ERROR_TYPES.DUPLICATE_ENTRY;
            case '23503': // PostgreSQL foreign key violation
            case '23502': // PostgreSQL not null violation
                return ERROR_TYPES.VALIDATION_ERROR;
            default:
                return ERROR_TYPES.DATABASE_ERROR;
        }
    }
    
    // Custom error types
    if (error.name === 'ValidationError') {
        return ERROR_TYPES.VALIDATION_ERROR;
    }
    
    if (error.message && error.message.toLowerCase().includes('not found')) {
        return ERROR_TYPES.NOT_FOUND;
    }
    
    if (error.message && error.message.toLowerCase().includes('unauthorized')) {
        return ERROR_TYPES.UNAUTHORIZED;
    }
    
    if (error.message && error.message.toLowerCase().includes('forbidden')) {
        return ERROR_TYPES.FORBIDDEN;
    }
    
    // Default to internal server error
    return ERROR_TYPES.INTERNAL_ERROR;
}

/**
 * Standardized error response handler
 * @param {object} res - Express response object
 * @param {Error} error - The error object
 * @param {string} operation - Operation being performed
 * @param {object} context - Additional context
 */
function handleError(res, error, operation, context = {}) {
    const errorType = determineErrorType(error);
    
    // Log the error
    logError(operation, error, context);
    
    // Create response based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = createErrorResponse(
        error.message || 'An unexpected error occurred',
        isDevelopment ? error.stack : undefined,
        errorType.code
    );
    
    // Send response
    res.status(errorType.status).json(errorResponse);
}

/**
 * Async error handler wrapper for controllers
 * @param {function} controllerFunction - The async controller function
 * @returns {function} Wrapped controller function with error handling
 */
function asyncErrorHandler(controllerFunction) {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next);
        } catch (error) {
            const operation = `${req.method} ${req.originalUrl}`;
            const context = {
                userId: req.user?.id,
                userRole: req.user?.role_id,
                params: req.params,
                query: req.query,
                ip: req.ip
            };
            
            handleError(res, error, operation, context);
        }
    };
}

/**
 * Create custom error with specific type
 * @param {string} message - Error message
 * @param {string} type - Error type key from ERROR_TYPES
 * @returns {Error} Custom error object
 */
function createCustomError(message, type = 'INTERNAL_ERROR') {
    const error = new Error(message);
    error.type = type;
    return error;
}

/**
 * Transaction error handler
 * @param {object} trx - Knex transaction object
 * @param {Error} error - The error that occurred
 * @param {string} operation - Operation being performed
 */
async function handleTransactionError(trx, error, operation) {
    try {
        await trx.rollback();
        logError(`${operation} - Transaction rolled back`, error);
    } catch (rollbackError) {
        logError(`${operation} - Rollback failed`, rollbackError);
    }
}

module.exports = {
    createErrorResponse,
    HTTP_STATUS,
    ERROR_TYPES,
    logError,
    handleValidationErrors,
    determineErrorType,
    handleError,
    asyncErrorHandler,
    createCustomError,
    handleTransactionError
};
