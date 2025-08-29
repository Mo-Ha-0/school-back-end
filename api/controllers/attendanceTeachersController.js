const attendanceTeachersService = require('../services/attendanceTeachersService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createAttendanceTeachers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            let { date, attendance } = req.body;
            const created_by = req.user.id; // Get the authenticated user's ID

            const attendance_teachers =
                await attendanceTeachersService.getAttendanceTeachersByDate(
                    date
                );
            if (attendance_teachers.length > 0) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Attendance already exists for this date.',
                            null,
                            'ATTENDANCE_ALREADY_EXISTS'
                        )
                    );
            }
            // Transform the attendance data to include date and created_by
            const transformedAttendance = attendance.map((record) => ({
                ...record,
                date,
                created_by,
            }));
            console.log(transformedAttendance);

            const AttendanceTeachers =
                await attendanceTeachersService.createAttendanceTeachers(
                    transformedAttendance
                );
            res.status(HTTP_STATUS.CREATED).json({
                attendance: AttendanceTeachers,
            });
        } catch (error) {
            logError('Create attendance teachers failed', error, {
                date: req.body.date,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create attendance records.',
                    null,
                    'CREATE_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async getAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.getAttendanceTeachers(
                    req.params.id
                );
            if (!AttendanceTeachers) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Teachers not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceTeachers);
        } catch (error) {
            logError('Get attendance teachers failed', error, {
                attendanceId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve attendance records.',
                    null,
                    'GET_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async getAllAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.getAllAttendanceTeachers();
            res.json(AttendanceTeachers);
        } catch (error) {
            logError('Get all attendance teachers failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve all attendance records.',
                    null,
                    'GET_ALL_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async updateAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.updateAttendanceTeachers(
                    req.params.id,
                    req.body
                );
            if (!AttendanceTeachers || AttendanceTeachers.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Teachers not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceTeachers);
        } catch (error) {
            logError('Update attendance teachers failed', error, {
                attendanceId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update attendance records.',
                    null,
                    'UPDATE_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async deleteAttendanceTeachers(req, res) {
        try {
            const result =
                await attendanceTeachersService.deleteAttendanceTeachers(
                    req.params.id
                );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Teachers not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Attendance records deleted successfully',
            });
        } catch (error) {
            logError('Delete attendance teachers failed', error, {
                attendanceId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete attendance records.',
                    null,
                    'DELETE_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async getAttendanceByTeacherId(req, res) {
        try {
            const { teacherId } = req.params;
            const attendance =
                await attendanceTeachersService.getAttendanceByTeacherId(
                    teacherId
                );

            const formatedAttendance = attendance.map((record) => ({
                ...record,
                date: toDateOnly(record.date),
            }));
            res.json(formatedAttendance);
        } catch (error) {
            logError('Get attendance by teacher ID failed', error, {
                teacherId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve attendance records for teacher.',
                    null,
                    'GET_TEACHER_ATTENDANCE_ERROR'
                )
            );
        }
    },
};
