const attendanceStudentsService = require('../services/attendanceStudentsService');
const fcmTokensService = require('../services/fcmTokensService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');
const { db } = require('../../config/db');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createAttendanceStudents(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            
            let { date, attendance } = req.body;
            const created_by = req.user.id; // Get the authenticated user's ID
    
            const attendance_students =
                await attendanceStudentsService.getAttendanceStudentsByDate(
                    date
                );
            if (attendance_students.length > 0) {
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
    
            const AttendanceStudents =
                await attendanceStudentsService.createAttendanceStudents(
                    transformedAttendance
                );
    
            // Check for late/absent students and send notifications
            const lateOrAbsentStudents = attendance.filter(record => 
                record.status === 'late' || record.status === 'absent'
            );
    
            if (lateOrAbsentStudents.length > 0) {
                // Send notifications for each late/absent student
                for (const record of lateOrAbsentStudents) {
                    try {
                        const title = 'Attendance Alert';
                        const body = `Your child has been marked as ${record.status.toUpperCase()} on ${date}`;
                      const student1=  await db('students').where({ id:record.student_id }).first();
                        await fcmTokensService.sendMessage(
                            student1.user_id, 
                            title, 
                            body
                        );
                        
                        console.log(`Notification sent for student ${record.student_id} (${record.status})`);
                    } catch (error) {
                        // Log error but don't stop the process
                        console.error(`Failed to send notification for student ${record.student_id}:`, error);
                        logError('Failed to send attendance notification', error, {
                            student_id: record.student_id,
                            status: record.status,
                            date: date
                        });
                    }
                }
            }
    
            res.status(HTTP_STATUS.CREATED).json({
                attendance: AttendanceStudents,
                notifications_sent: lateOrAbsentStudents.length
            });
        } catch (error) {
            logError('Create attendance students failed', error, {
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
    async getAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.getAttendanceStudents(
                    req.params.id
                );
            if (!AttendanceStudents) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Students not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceStudents);
        } catch (error) {
            logError('Get attendance students failed', error, {
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

    async getAllAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.getAllAttendanceStudents();
            res.json(AttendanceStudents);
        } catch (error) {
            logError('Get all attendance students failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve all attendance records.',
                    null,
                    'GET_ALL_ATTENDANCE_ERROR'
                )
            );
        }
    },

    async updateAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.updateAttendanceStudents(
                    req.params.id,
                    req.body
                );
            if (!AttendanceStudents || AttendanceStudents.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Students not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.json(AttendanceStudents);
        } catch (error) {
            logError('Update attendance students failed', error, {
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

    async deleteAttendanceStudents(req, res) {
        try {
            const result =
                await attendanceStudentsService.deleteAttendanceStudents(
                    req.params.id
                );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Attendance Students not found.',
                            null,
                            'ATTENDANCE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Attendance records deleted successfully',
            });
        } catch (error) {
            logError('Delete attendance students failed', error, {
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

    async getAttendanceByStudentId(req, res) {
        try {
            const { studentId } = req.params;
            const attendance =
                await attendanceStudentsService.getAttendanceByStudentId(
                    studentId
                );

            const formatedAttendance = attendance.map((record) => ({
                ...record,
                date: toDateOnly(record.date),
            }));
            res.json(formatedAttendance);
        } catch (error) {
            logError('Get attendance by student ID failed', error, {
                studentId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve attendance records for student.',
                    null,
                    'GET_STUDENT_ATTENDANCE_ERROR'
                )
            );
        }
    },
};
