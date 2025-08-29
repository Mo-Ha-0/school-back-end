const subjectService = require('../services/subjectService');
const { db } = require('../../config/db');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createSubject(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const { level_grade } = req.body;
            const curriculum = await db('curriculums')
                .select('*')
                .where({ level_grade: String(level_grade), is_active: true })
                .first();
            if (!curriculum) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Curriculum not found for provided level_grade.',
                            null,
                            'CURRICULUM_NOT_FOUND'
                        )
                    );
            }

            req.body.curriculum_id = curriculum.id;
            delete req.body.level_grade;

            const Subject = await subjectService.createSubject(req.body);
            res.status(HTTP_STATUS.CREATED).json(Subject);
        } catch (error) {
            logError('Create subject failed', error, {
                level_grade: req.body.level_grade,
                createdBy: req.user?.id,
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create subject due to server error.',
                    null,
                    'CREATE_SUBJECT_ERROR'
                )
            );
        }
    },

    async getSubject(req, res) {
        try {
            const Subject = await subjectService.getSubject(req.params.id);
            if (!Subject) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Subject not found.',
                            null,
                            'SUBJECT_NOT_FOUND'
                        )
                    );
            }
            res.json(Subject);
        } catch (error) {
            logError('Get subject failed', error, { subjectId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve subject.',
                    null,
                    'GET_SUBJECT_ERROR'
                )
            );
        }
    },

    async getAllSubjectes(req, res) {
        try {
            const Subject = await subjectService.getAllSubjectes();
            res.json(Subject);
        } catch (error) {
            logError('Get all subjects failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve subjects.',
                    null,
                    'GET_SUBJECTS_ERROR'
                )
            );
        }
    },

    async getAllSubjectesOfStudent(req, res) {
        const userId = req.user.id;
        try {
            const studentCurriculum = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!studentCurriculum) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Student record not found for this user.',
                            null,
                            'STUDENT_NOT_FOUND'
                        )
                    );
            }
            const subjects = await db('subjects')
                .select('*')
                .where({ curriculum_id: studentCurriculum.curriculum_id });

            res.json(subjects);
        } catch (error) {
            logError('Get student subjects failed', error, { userId });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve student subjects.',
                    null,
                    'GET_STUDENT_SUBJECTS_ERROR'
                )
            );
        }
    },

    async updateSubject(req, res) {
        try {
            const { level_grade } = req.body || {};

            if (level_grade !== undefined) {
                const curriculum = await db('curriculums')
                    .select('*')
                    .where({
                        level_grade: String(level_grade),
                        is_active: true,
                    })
                    .first();
                if (!curriculum) {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .json(
                            createErrorResponse(
                                'Curriculum not found for provided level_grade.',
                                null,
                                'CURRICULUM_NOT_FOUND'
                            )
                        );
                }

                req.body.curriculum_id = curriculum.id;
                delete req.body.level_grade;
            }

            const Subject = await subjectService.updateSubject(
                req.params.id,
                req.body
            );
            if (!Subject || Subject.length == 0)
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Subject not found.',
                            null,
                            'SUBJECT_NOT_FOUND'
                        )
                    );
            res.json(Subject);
        } catch (error) {
            logError('Update subject failed', error, {
                subjectId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update subject.',
                    null,
                    'UPDATE_SUBJECT_ERROR'
                )
            );
        }
    },

    async deleteSubject(req, res) {
        try {
            const result = await subjectService.deleteSubject(req.params.id);
            if (!result)
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Subject not found.',
                            null,
                            'SUBJECT_NOT_FOUND'
                        )
                    );
            res.status(HTTP_STATUS.OK).json({ message: 'deleted successfuly' });
        } catch (error) {
            logError('Delete subject failed', error, {
                subjectId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete subject.',
                    null,
                    'DELETE_SUBJECT_ERROR'
                )
            );
        }
    },

    async getSubjectsList(req, res) {
        try {
            const Subjects = await subjectService.getAllSubjectsNames();

            res.json(Subjects);
        } catch (error) {
            logError('Get subjects list failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve subjects list.',
                    null,
                    'GET_SUBJECTS_LIST_ERROR'
                )
            );
        }
    },
};
