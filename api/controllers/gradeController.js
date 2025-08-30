const gradeService = require('../services/gradeService');
const semesterService = require('../services/semesterService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async assignMark(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }

            const { subject_id, max_score, student_score, type, student_id } =
                req.body;

            // Validate that student_score doesn't exceed max_score
            if (student_score > max_score) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Student score cannot exceed maximum score.',
                            null,
                            'INVALID_SCORE'
                        )
                    );
            }

            // Get current semester
            const currentSemester = await semesterService.getCurrentSemester();
            if (!currentSemester) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'No active semester found.',
                            null,
                            'NO_ACTIVE_SEMESTER'
                        )
                    );
            }

            // Get student archive for current academic year
            const studentArchive =
                await gradeService.getStudentArchiveForCurrentYear(student_id);
            if (!studentArchive) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Student archive not found for current academic year.',
                            null,
                            'STUDENT_ARCHIVE_NOT_FOUND'
                        )
                    );
            }

            // Prepare grade data
            const gradeData = {
                archive_id: studentArchive.id,
                subject_id: subject_id,
                semester_id: currentSemester.id,
                min_score: 0, // Default minimum score
                max_score: max_score,
                grade: student_score,
                type: type,
            };

            // Create the grade
            const grade = await gradeService.createGrade(gradeData);

            res.status(HTTP_STATUS.CREATED).json({
                message: 'Mark assigned successfully',
                grade: grade[0],
                semester: currentSemester.semester_name,
                percentage:
                    ((student_score / max_score) * 100).toFixed(2) + '%',
            });
        } catch (error) {
            logError('Assign mark failed', error, {
                subject_id: req.body.subject_id,
                student_id: req.body.student_id,
                type: req.body.type,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to assign mark.',
                    null,
                    'ASSIGN_MARK_ERROR'
                )
            );
        }
    },

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
