const jwt = require('jsonwebtoken');
const roleService = require('../api/services/roleService');
const BlacklistedToken = require('../api/models/BlacklistedToken');
const { createErrorResponse, HTTP_STATUS, logError } = require('../api/utils/errorHandler');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    console.log('authMiddleware');
    const token = req.headers.authorization?.split(' ')[1] || req.headers.token; // Bearer <token>
    
    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
            createErrorResponse(
                'Access denied. No authentication token provided.',
                null,
                'NO_TOKEN'
            )
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await BlacklistedToken.findByToken(token);
        if (isBlacklisted) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(
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
            path: req.originalUrl
        });
        
        let errorMessage = 'Invalid authentication token.';
        let errorCode = 'INVALID_TOKEN';
        
        if (err.name === 'TokenExpiredError') {
            errorMessage = 'Authentication token has expired. Please sign in again.';
            errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Malformed authentication token.';
            errorCode = 'MALFORMED_TOKEN';
        }
        
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
            createErrorResponse(errorMessage, null, errorCode)
        );
    }
};

module.exports = authMiddleware;
