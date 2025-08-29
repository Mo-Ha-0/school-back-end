const answerService = require('../services/answerService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createAnswer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Answer = await answerService.createAnswer(req.body);
            res.status(HTTP_STATUS.CREATED).json(Answer);
        } catch (error) {
            logError('Create answer failed', error, {
                question_id: req.body.question_id,
                exam_attempt_id: req.body.exam_attempt_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create answer.',
                    null,
                    'CREATE_ANSWER_ERROR'
                )
            );
        }
    },

    async getAnswer(req, res) {
        try {
            const Answer = await answerService.getAnswer(req.params.id);
            if (!Answer) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Answer not found',
                            null,
                            'ANSWER_NOT_FOUND'
                        )
                    );
            }
            res.json(Answer);
        } catch (error) {
            logError('Get answer failed', error, { answerId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve answer.',
                    null,
                    'GET_ANSWER_ERROR'
                )
            );
        }
    },

    async getAllAnswers(req, res) {
        try {
            const Answers = await answerService.getAllAnswers();
            res.json(Answers);
        } catch (error) {
            logError('Get all answers failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve answers.',
                    null,
                    'GET_ANSWERS_ERROR'
                )
            );
        }
    },

    async updateAnswer(req, res) {
        try {
            const Answer = await answerService.updateAnswer(
                req.params.id,
                req.body
            );
            if (!Answer || Answer.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Answer not found',
                            null,
                            'ANSWER_NOT_FOUND'
                        )
                    );
            }
            res.json(Answer);
        } catch (error) {
            logError('Update answer failed', error, {
                answerId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update answer.',
                    null,
                    'UPDATE_ANSWER_ERROR'
                )
            );
        }
    },

    async deleteAnswer(req, res) {
        try {
            const result = await answerService.deleteAnswer(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Answer not found',
                            null,
                            'ANSWER_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Answer deleted successfully',
            });
        } catch (error) {
            logError('Delete answer failed', error, {
                answerId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete answer.',
                    null,
                    'DELETE_ANSWER_ERROR'
                )
            );
        }
    },
};
