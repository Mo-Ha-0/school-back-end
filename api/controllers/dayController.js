const dayService = require('../services/dayService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createDay(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Day = await dayService.createDay(req.body);
            res.status(HTTP_STATUS.CREATED).json(Day);
        } catch (error) {
            logError('Create day failed', error, {
                day_name: req.body.day_name,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create day.',
                    null,
                    'CREATE_DAY_ERROR'
                )
            );
        }
    },

    async getDay(req, res) {
        try {
            const day = await dayService.getDay(req.params.id);
            if (!day) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Day not found',
                            null,
                            'DAY_NOT_FOUND'
                        )
                    );
            }
            res.json(day);
        } catch (error) {
            logError('Get day failed', error, { dayId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve day.',
                    null,
                    'GET_DAY_ERROR'
                )
            );
        }
    },

    async getAllDays(req, res) {
        try {
            const days = await dayService.getAllDays();
            res.json(days);
        } catch (error) {
            logError('Get all days failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve days.',
                    null,
                    'GET_DAYS_ERROR'
                )
            );
        }
    },

    async updateDay(req, res) {
        try {
            const day = await dayService.updateDay(req.params.id, req.body);
            if (!day) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Day not found',
                            null,
                            'DAY_NOT_FOUND'
                        )
                    );
            }
            res.json(day);
        } catch (error) {
            logError('Update day failed', error, { dayId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update day.',
                    null,
                    'UPDATE_DAY_ERROR'
                )
            );
        }
    },

    async deleteDay(req, res) {
        try {
            const result = await dayService.deleteDay(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Day not found',
                            null,
                            'DAY_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Day deleted successfully',
            });
        } catch (error) {
            logError('Delete day failed', error, { dayId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete day.',
                    null,
                    'DELETE_DAY_ERROR'
                )
            );
        }
    },
};
