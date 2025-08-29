const permissionService = require('../services/permissionService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createPermission(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Permission = await permissionService.createPermission(
                req.body
            );
            res.status(HTTP_STATUS.CREATED).json(Permission);
        } catch (error) {
            logError('Create permission failed', error, {
                name: req.body.name,
                description: req.body.description,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create permission.',
                    null,
                    'CREATE_PERMISSION_ERROR'
                )
            );
        }
    },

    async getAllPermissions(req, res) {
        try {
            const Permissions = await permissionService.getAllPermissions();
            res.json(Permissions);
        } catch (error) {
            logError('Get all permissions failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve permissions.',
                    null,
                    'GET_PERMISSIONS_ERROR'
                )
            );
        }
    },
};
