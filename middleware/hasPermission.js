const { db } = require('../config/db');
const { createErrorResponse, HTTP_STATUS, logError } = require('../api/utils/errorHandler');

function hasPermission(...permissionNames) {
    // Support both hasPermission('perm') and hasPermission('perm1', 'perm2', ...)
    const required = Array.isArray(permissionNames[0])
        ? permissionNames[0]
        : permissionNames;

    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user || !user.role_id) {
                return res.status(HTTP_STATUS.FORBIDDEN).json(
                    createErrorResponse(
                        'Access denied. No role assigned to user.',
                        null,
                        'NO_ROLE_ASSIGNED'
                    )
                );
            }

            const result = await db('role_permissions')
                .join(
                    'permissions',
                    'role_permissions.permission_id',
                    'permissions.id'
                )
                .where('role_permissions.role_id', user.role_id)
                .select('permissions.name');

            const userPermissions = result.map((p) => p.name);

            // Allow if the user has ANY of the required permissions
            const hasAny = required.some((perm) =>
                userPermissions.includes(perm)
            );
            
            if (hasAny) {
                return next();
            }
            
            return res.status(HTTP_STATUS.FORBIDDEN).json(
                createErrorResponse(
                    `Access denied. Required permissions: ${required.join(', ')}`,
                    {
                        requiredPermissions: required,
                        userPermissions: userPermissions
                    },
                    'INSUFFICIENT_PERMISSIONS'
                )
            );
        } catch (err) {
            // Log the permission check error with context
            logError('Permission check failed', err, {
                userId: req.user?.id,
                roleId: req.user?.role_id,
                requiredPermissions: required,
                path: req.originalUrl,
                method: req.method
            });
            
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Permission check failed due to server error.',
                    null,
                    'PERMISSION_CHECK_ERROR'
                )
            );
        }
    };
}

module.exports = hasPermission;
