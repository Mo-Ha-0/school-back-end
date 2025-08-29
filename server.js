const express = require('express');
const app = express();
const apiRouter = require('./api');
const bodyparser = require('body-parser');
const cors = require('cors');
const userService = require('./api/services/userService');
const {
    createErrorResponse,
    logError,
    HTTP_STATUS,
} = require('./api/utils/errorHandler');

// Firebase SDK
const admin = require('./firebase/firebase-admin.js');
require('dotenv').config();

// Global uncaught exception handler
process.on('uncaughtException', (error) => {
    logError('Uncaught Exception', error, { critical: true });
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    process.exit(1);
});

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logError('Unhandled Rejection', reason, { promise, critical: true });
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    process.exit(1);
});

// Middleware for parsing JSON with error handling
app.use(
    express.json({
        limit: '10mb',
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);

// Body parser with error handling
app.use(bodyparser.json({ limit: '10mb' }));

// CORS protection
app.use(
    cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    })
);

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`
    );
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API routes
app.use('/api', apiRouter);

// Handle 404 - Route not found (catch all unmatched routes)
app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(
            `Route ${req.originalUrl} not found on this server`,
            null,
            'ROUTE_NOT_FOUND'
        )
    );
});

// Global error handling middleware
app.use((err, req, res, next) => {
    // Log the error
    logError('Global error handler', err, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });

    // Handle specific error types
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong on the server';
    let code = 'INTERNAL_ERROR';

    // JSON parsing errors
    if (err.type === 'entity.parse.failed') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid JSON in request body';
        code = 'INVALID_JSON';
    }

    // Request entity too large
    if (err.type === 'entity.too.large') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Request entity too large';
        code = 'PAYLOAD_TOO_LARGE';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = err.message || 'Validation failed';
        code = 'VALIDATION_ERROR';
    }

    // Database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        message = 'Database connection failed';
        code = 'DATABASE_CONNECTION_ERROR';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    }

    // Send error response
    res.status(statusCode).json(
        createErrorResponse(
            message,
            process.env.NODE_ENV === 'development' ? err.stack : undefined,
            code
        )
    );
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Close server first
    server.close(() => {
        console.log('HTTP server closed.');

        // Close database connections, cleanup resources, etc.
        // Add your cleanup logic here

        console.log('Graceful shutdown completed.');
        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 School Management System Server`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
