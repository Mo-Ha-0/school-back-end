const jwt = require('jsonwebtoken');
const roleService = require('../api/services/roleService');
const BlacklistedToken = require('../api/models/BlacklistedToken');
const {
    createErrorResponse,
    HTTP_STATUS,
    logError,
} = require('../api/utils/errorHandler');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    console.log('authMiddleware');
    const token = req.headers.authorization?.split(' ')[1] || req.headers.token; // Bearer <token>

    if (!token) {
        return res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json(
                createErrorResponse(
                    'Access denied. No authentication token provided.',
                    null,
                    'NO_TOKEN'
                )
            );
    }

    try {
        // Check if JWT_SECRET is properly configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET environment variable is not set!');
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .json(
                    createErrorResponse(
                        'Server configuration error: JWT secret not configured',
                        null,
                        'SERVER_CONFIG_ERROR'
                    )
                );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await BlacklistedToken.findByToken(token);
        if (isBlacklisted) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createErrorResponse(
                        'Token has been revoked. Please sign in again.',
                        null,
                        'TOKEN_REVOKED'
                    )
                );
        }

        const permissions = await roleService.getPermissionsOfRole(
            decoded.roleId
        );

        req.user = {
            id: decoded.userId,
            role_id: decoded.roleId,
            permissions: permissions,
        };
        next();
    } catch (err) {
        // Log the authentication error
        logError('Authentication failed', err, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.originalUrl,
        });

        let errorMessage = 'Invalid authentication token.';
        let errorCode = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
            errorMessage =
                'Authentication token has expired. Please sign in again.';
            errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
            if (err.message === 'invalid signature') {
                errorMessage =
                    'Token signature verification failed. This usually indicates a server configuration issue.';
                errorCode = 'INVALID_SIGNATURE';
                console.error(
                    'JWT signature verification failed. Check if JWT_SECRET is properly configured.'
                );
            } else {
                errorMessage = 'Malformed authentication token.';
                errorCode = 'MALFORMED_TOKEN';
            }
        }

        res.status(HTTP_STATUS.UNAUTHORIZED).json(
            createErrorResponse(errorMessage, null, errorCode)
        );
    }
};

module.exports = authMiddleware;
