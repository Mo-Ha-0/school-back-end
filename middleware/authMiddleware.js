const jwt = require('jsonwebtoken');
const roleService = require('../api/services/roleService');
const BlacklistedToken = require('../api/models/BlacklistedToken');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    console.log('authMiddleware');
    const token = req.headers.authorization?.split(' ')[1] || req.headers.token; // Bearer <token>
    // const token = req.headers.token;
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await BlacklistedToken.findByToken(token);
        if (isBlacklisted) {
            return res
                .status(401)
                .json({ error: 'Token revoked. Please sign in again' });
        }

        const permissions = await roleService.getPermissionsOfRole(
            decoded.roleId
        );
        // req.userId = decoded.userId; // Attach user ID to the request
        req.user = {
            id: decoded.userId,
            role_id: decoded.roleId,
            permissions: permissions, // Include this in your JWT payload
        };
        next();
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
};

module.exports = authMiddleware;
