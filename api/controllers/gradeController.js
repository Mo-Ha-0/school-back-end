const gradeService = require('../services/gradeService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createGrade(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Grade = await gradeService.createGrade(req.body);
            res.status(HTTP_STATUS.CREATED).json(Grade);
        } catch (error) {
            logError('Create grade failed', error, {
                student_id: req.body.student_id,
                subject_id: req.body.subject_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create grade.',
                    null,
                    'CREATE_GRADE_ERROR'
                )
            );
        }
    },

    async getGrade(req, res) {
        try {
            const Grade = await gradeService.getGrade(req.params.id);
            if (!Grade) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Grade not found.',
                            null,
                            'GRADE_NOT_FOUND'
                        )
                    );
            }
            res.json(Grade);
        } catch (error) {
            logError('Get grade failed', error, { gradeId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve grade.',
                    null,
                    'GET_GRADE_ERROR'
                )
            );
        }
    },

    async getAllGrades(req, res) {
        try {
            const Grade = await gradeService.getAllGradees();
            res.json(Grade);
        } catch (error) {
            logError('Get all grades failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve grades.',
                    null,
                    'GET_GRADES_ERROR'
                )
            );
        }
    },

    async updateGrade(req, res) {
        try {
            const Grade = await gradeService.updateGrade(
                req.params.id,
                req.body
            );
            if (!Grade || Grade.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Grade not found.',
                            null,
                            'GRADE_NOT_FOUND'
                        )
                    );
            }
            res.json(Grade);
        } catch (error) {
            logError('Update grade failed', error, { gradeId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update grade.',
                    null,
                    'UPDATE_GRADE_ERROR'
                )
            );
        }
    },

    async deleteGrade(req, res) {
        try {
            const result = await gradeService.deleteGrade(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Grade not found.',
                            null,
                            'GRADE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Grade deleted successfully',
            });
        } catch (error) {
            logError('Delete grade failed', error, { gradeId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete grade.',
                    null,
                    'DELETE_GRADE_ERROR'
                )
            );
        }
    },
};
