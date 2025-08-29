const optionService = require('../services/optionService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createOption(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Option = await optionService.createOption(req.body);
            res.status(HTTP_STATUS.CREATED).json(Option);
        } catch (error) {
            logError('Create option failed', error, {
                question_id: req.body.question_id,
                text: req.body.text,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create option.',
                    null,
                    'CREATE_OPTION_ERROR'
                )
            );
        }
    },

    async getOption(req, res) {
        try {
            const Option = await optionService.getOption(req.params.id);
            if (!Option) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Option not found',
                            null,
                            'OPTION_NOT_FOUND'
                        )
                    );
            }
            res.json(Option);
        } catch (error) {
            logError('Get option failed', error, { optionId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve option.',
                    null,
                    'GET_OPTION_ERROR'
                )
            );
        }
    },

    async getAllOptions(req, res) {
        try {
            const Options = await optionService.getAllOptions();
            res.json(Options);
        } catch (error) {
            logError('Get all options failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve options.',
                    null,
                    'GET_OPTIONS_ERROR'
                )
            );
        }
    },

    async updateOption(req, res) {
        try {
            const Option = await optionService.updateOption(
                req.params.id,
                req.body
            );
            if (!Option || Option.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Option not found',
                            null,
                            'OPTION_NOT_FOUND'
                        )
                    );
            }
            res.json(Option);
        } catch (error) {
            logError('Update option failed', error, {
                optionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update option.',
                    null,
                    'UPDATE_OPTION_ERROR'
                )
            );
        }
    },

    async deleteOption(req, res) {
        try {
            const result = await optionService.deleteOption(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Option not found',
                            null,
                            'OPTION_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Option deleted successfully',
            });
        } catch (error) {
            logError('Delete option failed', error, {
                optionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete option.',
                    null,
                    'DELETE_OPTION_ERROR'
                )
            );
        }
    },
};
