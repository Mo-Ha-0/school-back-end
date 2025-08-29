const examQuestionService = require('../services/examQuestionService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

module.exports = {
    async createExamQuestion(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json(handleValidationErrors(errors));
        }
        const { db } = require('../../config/db');
        const { questions, exam_id } = req.body;
        const trx = await db.transaction();

        try {
            const results = [];

            for (const question of questions) {
                const ExamQuestion =
                    await examQuestionService.createExamQuestion(
                        {
                            question_id: question.question_id,
                            mark: question.mark,
                            exam_id: exam_id,
                        },
                        trx
                    );

                results.push(ExamQuestion[0]);
            }

            await trx.commit();
            res.status(HTTP_STATUS.CREATED).json(results);
        } catch (error) {
            await handleTransactionError(trx, error, 'Create exam question');
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create exam question.',
                    null,
                    'CREATE_EXAM_QUESTION_ERROR'
                )
            );
        }
    },

    async getExamQuestion(req, res) {
        try {
            const ExamQuestion = await examQuestionService.getExamQuestion(
                req.params.id
            );
            if (!ExamQuestion) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam question not found',
                            null,
                            'EXAM_QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.json(ExamQuestion);
        } catch (error) {
            logError('Get exam question failed', error, {
                examQuestionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exam question.',
                    null,
                    'GET_EXAM_QUESTION_ERROR'
                )
            );
        }
    },

    async getAllExamQuestions(req, res) {
        try {
            const ExamQuestions =
                await examQuestionService.getAllExamQuestions();
            res.json(ExamQuestions);
        } catch (error) {
            logError('Get all exam questions failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exam questions.',
                    null,
                    'GET_EXAM_QUESTIONS_ERROR'
                )
            );
        }
    },

    async updateExamQuestion(req, res) {
        try {
            const ExamQuestion = await examQuestionService.updateExamQuestion(
                req.params.id,
                req.body
            );
            if (!ExamQuestion || ExamQuestion.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam question not found',
                            null,
                            'EXAM_QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.json(ExamQuestion);
        } catch (error) {
            logError('Update exam question failed', error, {
                examQuestionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update exam question.',
                    null,
                    'UPDATE_EXAM_QUESTION_ERROR'
                )
            );
        }
    },

    async deleteExamQuestion(req, res) {
        try {
            const result = await examQuestionService.deleteExamQuestion(
                req.params.id
            );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam question not found',
                            null,
                            'EXAM_QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Exam question deleted successfully',
            });
        } catch (error) {
            logError('Delete exam question failed', error, {
                examQuestionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete exam question.',
                    null,
                    'DELETE_EXAM_QUESTION_ERROR'
                )
            );
        }
    },

    // async getExamQuestionQuestion(req, res) {
    //     try {
    //       const ExamQuestion = await examQuestionService.getExamQuestion(req.body.id);
    //       if(!ExamQuestion) return res.status(404).json({error:'ExamQuestion Not found'});
    //         const result = await ExamQuestionService.getExamQuestionQuestion(req.body.id);
    //         if (!result) return res.status(404).json({ error: 'ExamQuestion questions not found' });
    //         res.json(result);
    //     } catch (error) {
    //         res.status(400).json({ error: error.message });
    //     }
    // },
};
