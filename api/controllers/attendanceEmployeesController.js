const attendanceEmployeesService = require('../services/attendanceEmployeesService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createAttendanceEmployees(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            let { date, attendance } = req.body;
            const created_by = req.user.id; // Get the authenticated user's ID

            const attendance_employees =
                await attendanceEmployeesService.getAttendanceEmployeesByDate(
                    date
                );
            if (attendance_employees.length > 0) {
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

            const AttendanceEmployees =
                await attendanceEmployeesService.createAttendanceEmployees(
                    transformedAttendance
                );
            res.status(HTTP_STATUS.CREATED).json({
                attendance: AttendanceEmployees,
            });
        } catch (error) {
            logError('Create attendance employees failed', error, {
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

    async getAttendanceEmployees(req, res) {
        try {
            const AttendanceEmployees =
                await attendanceEmployeesService.getAttendanceEmployees(
                    req.params.id
                );
            if (!AttendanceEmployees) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Employees not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceEmployees);
        } catch (error) {
            logError('Get attendance employees failed', error, {
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

    async getAllAttendanceEmployees(req, res) {
        try {
            const AttendanceEmployees =
                await attendanceEmployeesService.getAllAttendanceEmployees();
            res.json(AttendanceEmployees);
        } catch (error) {
            logError('Get all attendance employees failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve all attendance records.',
                    null,
                    'GET_ALL_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async updateAttendanceEmployees(req, res) {
        try {
            const AttendanceEmployees =
                await attendanceEmployeesService.updateAttendanceEmployees(
                    req.params.id,
                    req.body
                );
            if (!AttendanceEmployees || AttendanceEmployees.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Employees not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceEmployees);
        } catch (error) {
            logError('Update attendance employees failed', error, {
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

    async deleteAttendanceEmployees(req, res) {
        try {
            const result =
                await attendanceEmployeesService.deleteAttendanceEmployees(
                    req.params.id
                );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Employees not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Attendance records deleted successfully',
            });
        } catch (error) {
            logError('Delete attendance employees failed', error, {
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

    async getAttendanceByEmployeeId(req, res) {
        try {
            const { employeeId } = req.params;
            const attendance =
                await attendanceEmployeesService.getAttendanceByEmployeeId(
                    employeeId
                );

            const formatedAttendance = attendance.map((record) => ({
                ...record,
                date: toDateOnly(record.date),
            }));
            res.json(formatedAttendance);
        } catch (error) {
            logError('Get attendance by employee ID failed', error, {
                employeeId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve attendance records for employee.',
                    null,
                    'GET_EMPLOYEE_ATTENDANCE_ERROR'
                )
            );
        }
    },
};
