const archiveService = require('../services/archiveService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createArchive(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Archive = await archiveService.createArchive(req.body);
            res.status(HTTP_STATUS.CREATED).json(Archive);
        } catch (error) {
            logError('Create archive failed', error, {
                table_name: req.body.table_name,
                record_id: req.body.record_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create archive.',
                    null,
                    'CREATE_ARCHIVE_ERROR'
                )
            );
        }
    },

    async getArchive(req, res) {
        try {
            const Archive = await archiveService.getArchive(req.params.id);
            if (!Archive) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Archive not found',
                            null,
                            'ARCHIVE_NOT_FOUND'
                        )
                    );
            }
            res.json(Archive);
        } catch (error) {
            logError('Get archive failed', error, { archiveId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve archive.',
                    null,
                    'GET_ARCHIVE_ERROR'
                )
            );
        }
    },

    async getAllArchives(req, res) {
        try {
            const Archive = await archiveService.getAllArchives();
            res.json(Archive);
        } catch (error) {
            logError('Get all archives failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve archives.',
                    null,
                    'GET_ARCHIVES_ERROR'
                )
            );
        }
    },

    async updateArchive(req, res) {
        try {
            const Archive = await archiveService.updateArchive(
                req.params.id,
                req.body
            );
            if (!Archive || Archive.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Archive not found',
                            null,
                            'ARCHIVE_NOT_FOUND'
                        )
                    );
            }
            res.json(Archive);
        } catch (error) {
            logError('Update archive failed', error, {
                archiveId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update archive.',
                    null,
                    'UPDATE_ARCHIVE_ERROR'
                )
            );
        }
    },

    async deleteArchive(req, res) {
        try {
            const result = await archiveService.deleteArchive(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Archive not found',
                            null,
                            'ARCHIVE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Archive deleted successfully',
            });
        } catch (error) {
            logError('Delete archive failed', error, {
                archiveId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete archive.',
                    null,
                    'DELETE_ARCHIVE_ERROR'
                )
            );
        }
    },
};
