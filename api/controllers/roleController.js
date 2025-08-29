const roleService = require('../services/roleService');
const { db } = require('../../config/db');
const {
    createErrorResponse,
    HTTP_STATUS,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createRole(req, res) {
        try {
            const { name, permissions } = req.body;

            const exists = await roleService.getRoleByName(name);

            if (!exists[0]) {
                const permissionsFromDB = await db('permissions').select('id');
                const Ids = permissionsFromDB.map((id) => id.id);

                const allValid = permissions.every((permission) =>
                    Ids.includes(permission)
                );
                if (allValid === false) {
                    return res
                        .status(HTTP_STATUS.BAD_REQUEST)
                        .json(
                            createErrorResponse(
                                'Invalid permissions provided',
                                null,
                                'INVALID_PERMISSIONS'
                            )
                        );
                }

                const role = await roleService.createRole({ name });

                if (permissions.length > 0) {
                    var permissionIds = await db('permissions')
                        .whereIn('id', permissions)
                        .select('*');
                    if (permissionIds.length > 0) {
                        const pIds = permissionIds.map((id) => id.id);

                        const result =
                            await roleService.assignPermissionsToRole(
                                role.id,
                                pIds
                            );
                    }
                }
                return res
                    .status(HTTP_STATUS.CREATED)
                    .json({ role, permission_ids: permissionIds });
            }

            return res
                .status(HTTP_STATUS.CONFLICT)
                .json(
                    createErrorResponse(
                        'Role already exists',
                        null,
                        'ROLE_ALREADY_EXISTS'
                    )
                );
        } catch (err) {
            logError('Create role failed', err, {
                roleName: req.body.name,
                permissions: req.body.permissions,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create role.',
                    null,
                    'CREATE_ROLE_ERROR'
                )
            );
        }
    },

    async getAllRoles(req, res) {
        try {
            const roles = await roleService.getAllRoles();
            res.status(HTTP_STATUS.OK).json(roles);
        } catch (err) {
            logError('Get all roles failed', err);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve roles.',
                    null,
                    'GET_ROLES_ERROR'
                )
            );
        }
    },

    async getAllEmployeesRoles(req, res) {
        try {
            const roles = await roleService.getAllEmployeesRoles();

            res.status(HTTP_STATUS.OK).json(roles);
        } catch (err) {
            logError('Get all employee roles failed', err);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve employee roles.',
                    null,
                    'GET_EMPLOYEE_ROLES_ERROR'
                )
            );
        }
    },

    async updatePermissions(req, res) {
        try {
            const { roleId, permissions } = req.body;
            const roleIdNum = parseInt(roleId, 10);
            const exists = await roleService.getRoleById(roleIdNum);

            if (exists[0]) {
                if (permissions.length > 0) {
                    var permissionIds = await db('permissions')
                        .whereIn('id', permissions)
                        .select('*');

                    if (permissionIds.length > 0) {
                        const pIds = permissionIds.map((id) => id.id);

                        const result =
                            await roleService.updatePermissionsToRole(
                                exists[0].id,
                                pIds
                            );
                    }
                }
                return res
                    .status(HTTP_STATUS.CREATED)
                    .json({ role: exists[0], permission_ids: permissionIds });
            }

            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json(
                    createErrorResponse(
                        'Role does not exist',
                        null,
                        'ROLE_NOT_FOUND'
                    )
                );
        } catch (err) {
            logError('Update permissions failed', err, {
                roleId: req.body.roleId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update permissions.',
                    null,
                    'UPDATE_PERMISSIONS_ERROR'
                )
            );
        }
    },

    async getRolePermissions(req, res) {
        try {
            const { roleId } = req.params;
            const roleIdNum = parseInt(roleId, 10);
            const role = await roleService.getRoleById(roleIdNum);
            if (!role[0]) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Role does not exist',
                            null,
                            'ROLE_NOT_FOUND'
                        )
                    );
            }
            const permissions = await roleService.getPermissionsOfRole(
                roleIdNum
            );

            res.status(HTTP_STATUS.OK).json(permissions);
        } catch (err) {
            logError('Get role permissions failed', err, {
                roleId: req.params.roleId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve role permissions.',
                    null,
                    'GET_ROLE_PERMISSIONS_ERROR'
                )
            );
        }
    },

    async deleteRole(req, res) {
        try {
            const { roleId } = req.params;
            const role = await roleService.deleteRole(roleId);

            if (!role) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Role not found',
                            null,
                            'ROLE_NOT_FOUND'
                        )
                    );
            }

            res.status(HTTP_STATUS.OK).json({
                message: 'Role deleted successfully',
            });
        } catch (err) {
            logError('Delete role failed', err, { roleId: req.params.roleId });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete role.',
                    null,
                    'DELETE_ROLE_ERROR'
                )
            );
        }
    },

    async updateRoleName(req, res) {
        try {
            const { roleId } = req.params;
            const { name } = req.body;
            if (!name || typeof name !== 'string') {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Invalid role name',
                            null,
                            'INVALID_ROLE_NAME'
                        )
                    );
            }
            const updated = await roleService.updateRoleName(
                parseInt(roleId, 10),
                name
            );
            if (!updated) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Role not found',
                            null,
                            'ROLE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json(updated);
        } catch (err) {
            logError('Update role name failed', err, {
                roleId: req.params.roleId,
                newName: req.body.name,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update role name.',
                    null,
                    'UPDATE_ROLE_NAME_ERROR'
                )
            );
        }
    },
};
