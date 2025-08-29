const periodService = require('../services/periodService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createPeriod(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Period = await periodService.createPeriod(req.body);
            res.status(HTTP_STATUS.CREATED).json(Period);
        } catch (error) {
            logError('Create period failed', error, {
                period_name: req.body.period_name,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create period.',
                    null,
                    'CREATE_PERIOD_ERROR'
                )
            );
        }
    },

    async getPeriod(req, res) {
        try {
            const period = await periodService.getPeriod(req.params.id);
            if (!period) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Period not found',
                            null,
                            'PERIOD_NOT_FOUND'
                        )
                    );
            }
            res.json(period);
        } catch (error) {
            logError('Get period failed', error, { periodId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve period.',
                    null,
                    'GET_PERIOD_ERROR'
                )
            );
        }
    },

    async getAllPeriods(req, res) {
        try {
            const periods = await periodService.getAllPeriods();
            res.json(periods);
        } catch (error) {
            logError('Get all periods failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve periods.',
                    null,
                    'GET_PERIODS_ERROR'
                )
            );
        }
    },

    async updatePeriod(req, res) {
        try {
            const period = await periodService.updatePeriod(
                req.params.id,
                req.body
            );
            if (!period) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Period not found',
                            null,
                            'PERIOD_NOT_FOUND'
                        )
                    );
            }
            res.json(period);
        } catch (error) {
            logError('Update period failed', error, {
                periodId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update period.',
                    null,
                    'UPDATE_PERIOD_ERROR'
                )
            );
        }
    },

    async deletePeriod(req, res) {
        try {
            const result = await periodService.deletePeriod(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Period not found',
                            null,
                            'PERIOD_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Period deleted successfully',
            });
        } catch (error) {
            logError('Delete period failed', error, {
                periodId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete period.',
                    null,
                    'DELETE_PERIOD_ERROR'
                )
            );
        }
    },
};
