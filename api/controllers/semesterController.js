const semesterService = require('../services/semesterService');
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
    async createSemester(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Semester = await semesterService.createSemester(req.body);
            res.status(HTTP_STATUS.CREATED).json(Semester);
        } catch (error) {
            logError('Create semester failed', error, {
                semester_name: req.body.semester_name,
                academic_year_id: req.body.academic_year_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create semester.',
                    null,
                    'CREATE_SEMESTER_ERROR'
                )
            );
        }
    },

    async getSemester(req, res) {
        try {
            const Semester = await semesterService.getSemester(req.params.id);
            if (!Semester) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Semester not found',
                            null,
                            'SEMESTER_NOT_FOUND'
                        )
                    );
            }
            res.json(Semester);
        } catch (error) {
            logError('Get semester failed', error, {
                semesterId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve semester.',
                    null,
                    'GET_SEMESTER_ERROR'
                )
            );
        }
    },

    async getAllSemesters(req, res) {
        try {
            const Semester = await semesterService.getAllSemesters();
            res.json(Semester);
        } catch (error) {
            logError('Get all semesters failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve semesters.',
                    null,
                    'GET_SEMESTERS_ERROR'
                )
            );
        }
    },

    async updateSemester(req, res) {
        try {
            const Semester = await semesterService.updateSemester(
                req.params.id,
                req.body
            );
            if (!Semester || Semester.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Semester not found',
                            null,
                            'SEMESTER_NOT_FOUND'
                        )
                    );
            }
            res.json(Semester);
        } catch (error) {
            logError('Update semester failed', error, {
                semesterId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update semester.',
                    null,
                    'UPDATE_SEMESTER_ERROR'
                )
            );
        }
    },

    async deleteSemester(req, res) {
        try {
            const result = await semesterService.deleteSemester(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Semester not found',
                            null,
                            'SEMESTER_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Semester deleted successfully',
            });
        } catch (error) {
            logError('Delete semester failed', error, {
                semesterId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete semester.',
                    null,
                    'DELETE_SEMESTER_ERROR'
                )
            );
        }
    },

    async getsemestersBySubject(req, res) {
        const { subject_id } = req.params;
        const userId = req.user.id;
        try {
            // Check if any exams exist for this subject
            const examExists = await db('exams').where({ subject_id }).first();
            if (!examExists) {
                return res.json('There are no exams for this subject');
            }

            // 1. Get the student's curriculum
            const student = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!student) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Student record not found for this user',
                            null,
                            'STUDENT_NOT_FOUND'
                        )
                    );
            }

            // 2. Get the curriculum of the subject
            const subject = await db('subjects')
                .select('curriculum_id')
                .where({ id: subject_id })
                .first();

            if (!subject) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Subject not found',
                            null,
                            'SUBJECT_NOT_FOUND'
                        )
                    );
            }

            // 3. Make sure the curriculum matches
            if (student.curriculum_id !== subject.curriculum_id) {
                return res
                    .status(HTTP_STATUS.FORBIDDEN)
                    .json(
                        createErrorResponse(
                            'Student curriculum does not match subject curriculum',
                            null,
                            'CURRICULUM_MISMATCH'
                        )
                    );
            }

            // Get distinct semesters with valid exams
            const semesters = await db('exams')
                .join('semesters', 'exams.semester_id', 'semesters.id')
                .distinct('semesters.id', 'semesters.semester_name')
                .where('exams.subject_id', subject_id)
                .where('exams.end_datetime', '<=', db.fn.now())
                .select('semesters.semester_name');

            if (semesters.length === 0) {
                return res.json('There are no valid exams for this subject');
            }

            res.json(semesters);
        } catch (err) {
            logError('Get semesters by subject failed', err, {
                subject_id,
                userId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve semesters for subject.',
                    null,
                    'GET_SUBJECT_SEMESTERS_ERROR'
                )
            );
        }
    },

    // async getStudentsInAcademicYear(req, res) {
    //   try {
    //     const AcademicYearExists = await academicYearService.getAcademicYear(req.body.id);
    //     if (!AcademicYearExists) return res.status(404).json({ error: 'AcademicYear not found' });
    //     const Students = await academicYearService.getStudentsInAcademicYear(req.body.id);
    //     if (!Students) return res.status(404).json({ error: 'Students not found' });
    //     res.json(Students);
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // },
};
