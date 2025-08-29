const { db } = require('../../config/db');
const examService = require('../services/examService');
const qustionService = require('../services/qustionService');
const optionService = require('../services/optionService');
const { validationResult, body } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

module.exports = {
    async createQuestion(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const { question_text, subject_id, type, options } = req.body;
            const result = await db.transaction(async (trx) => {
                const Question = await qustionService.createQuestion(
                    { question_text, subject_id, type },
                    trx
                );

                const addedOptions = options.map((option) => ({
                    text: option.text,
                    is_correct: option.is_correct,
                    question_id: Question[0].id,
                }));

                const Options = await optionService.createOption(
                    addedOptions,
                    trx
                );
                return { Question, Options };
            });

            res.status(HTTP_STATUS.CREATED).json(result);
        } catch (error) {
            logError('Create question failed', error, {
                subject_id: req.body.subject_id,
                type: req.body.type,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create question.',
                    null,
                    'CREATE_QUESTION_ERROR'
                )
            );
        }
    },

    async getQuestion(req, res) {
        try {
            const Question = await qustionService.getQuestion(req.params.id);
            if (!Question) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Question not found',
                            null,
                            'QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.json(Question);
        } catch (error) {
            logError('Get question failed', error, {
                questionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve question.',
                    null,
                    'GET_QUESTION_ERROR'
                )
            );
        }
    },

    async getAllQuestions(req, res) {
        try {
            const Questions = await qustionService.getAllQuestions();
            res.json(Questions);
        } catch (error) {
            logError('Get all questions failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve questions.',
                    null,
                    'GET_QUESTIONS_ERROR'
                )
            );
        }
    },

    async getExamQuestions(req, res) {
        try {
            const { exam_id } = req.params;
            const exam = await examService.getExam(exam_id);
            const exam_question = await db('exam_question')
                .select('*')
                .where({ exam_id });

            const question_ids = await exam_question.map(
                (el) => el.question_id
            );

            var questions = await db('questions')
                .whereIn('id', question_ids)
                .select('id', 'question_text', 'type', 'subject_id');

            const subjectIds = [...new Set(questions.map((q) => q.subject_id))];

            const subjects = await db('subjects')
                .whereIn('id', subjectIds)
                .select('id', 'name');

            const subjectMap = subjects.reduce((map, subject) => {
                map[subject.id] = subject.name;
                return map;
            }, {});

            const questionsWithSubjects = questions.map((question) => ({
                ...question,
                subject_name: subjectMap[question.subject_id] || null,
            }));

            res.json({ questions: questionsWithSubjects });
        } catch (error) {
            logError('Get exam questions failed', error, {
                exam_id: req.params.exam_id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exam questions.',
                    null,
                    'GET_EXAM_QUESTIONS_ERROR'
                )
            );
        }
    },

    async updateQuestion(req, res) {
        try {
            const Question = await qustionService.updateQuestion(
                req.params.id,
                req.body
            );
            if (!Question || Question.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Question not found',
                            null,
                            'QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.json(Question);
        } catch (error) {
            logError('Update question failed', error, {
                questionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update question.',
                    null,
                    'UPDATE_QUESTION_ERROR'
                )
            );
        }
    },

    async deleteQuestion(req, res) {
        try {
            const result = await qustionService.deleteQuestion(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Question not found',
                            null,
                            'QUESTION_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Question deleted successfully',
            });
        } catch (error) {
            logError('Delete question failed', error, {
                questionId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete question.',
                    null,
                    'DELETE_QUESTION_ERROR'
                )
            );
        }
    },
};
