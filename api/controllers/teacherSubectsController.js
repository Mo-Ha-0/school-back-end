const teacherSubjectsSubjects = require('../services/teacherSubjectsSubjects');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createTeachersSubects(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const TeachersSubects =
                await teacherSubjectsSubjects.createTeachersSubjects(req.body);
            res.status(HTTP_STATUS.CREATED).json(TeachersSubects);
        } catch (error) {
            logError('Create teacher subjects failed', error, {
                teacher_id: req.body.teacher_id,
                subject_id: req.body.subject_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create teacher subjects.',
                    null,
                    'CREATE_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },

    async getTeachersSubects(req, res) {
        try {
            const TeachersSubects =
                await teacherSubjectsSubjects.getTeachersSubjects(
                    req.params.id
                );
            if (!TeachersSubects) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher subjects not found',
                            null,
                            'TEACHER_SUBJECTS_NOT_FOUND'
                        )
                    );
            }
            res.json(TeachersSubects);
        } catch (error) {
            logError('Get teacher subjects failed', error, {
                teacherSubjectsId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher subjects.',
                    null,
                    'GET_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },

    async getAllTeachersSubectss(req, res) {
        try {
            const TeachersSubects =
                await teacherSubjectsSubjects.getAllTeachersSubjects();
            res.json(TeachersSubects);
        } catch (error) {
            logError('Get all teacher subjects failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher subjects.',
                    null,
                    'GET_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },

    async updateTeachersSubects(req, res) {
        try {
            const TeachersSubects =
                await teacherSubjectsSubjects.updateTeachersSubjects(
                    req.params.id,
                    req.body
                );
            if (!TeachersSubects) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher subjects not found',
                            null,
                            'TEACHER_SUBJECTS_NOT_FOUND'
                        )
                    );
            }
            res.json(TeachersSubects);
        } catch (error) {
            logError('Update teacher subjects failed', error, {
                teacherSubjectsId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update teacher subjects.',
                    null,
                    'UPDATE_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },

    async deleteTeachersSubects(req, res) {
        try {
            const result = await teacherSubjectsSubjects.deleteTeachersSubjects(
                req.params.id
            );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher subjects not found',
                            null,
                            'TEACHER_SUBJECTS_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Teacher subjects deleted successfully',
            });
        } catch (error) {
            logError('Delete teacher subjects failed', error, {
                teacherSubjectsId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete teacher subjects.',
                    null,
                    'DELETE_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },
};
