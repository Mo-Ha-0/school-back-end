const attendanceStudentsService = require('../services/attendanceStudentsService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');

module.exports = {
    async createAttendanceStudents(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let { date, attendance } = req.body;
            const created_by = req.user.id; // Get the authenticated user's ID

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
            res.status(201).json({ attendance: AttendanceStudents });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.getAttendanceStudents(
                    req.params.id
                );
            if (!AttendanceStudents)
                return res
                    .status(404)
                    .json({ error: 'Attendance Students not found' });
            res.json(AttendanceStudents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.getAllAttendanceStudents();
            res.json(AttendanceStudents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateAttendanceStudents(req, res) {
        try {
            const AttendanceStudents =
                await attendanceStudentsService.updateAttendanceStudents(
                    req.params.id,
                    req.body
                );
            if (!AttendanceStudents || AttendanceStudents.length == 0)
                return res
                    .status(404)
                    .json({ error: 'AttendanceStudents not found' });
            res.json(AttendanceStudents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteAttendanceStudents(req, res) {
        try {
            const result =
                await attendanceStudentsService.deleteAttendanceStudents(
                    req.params.id
                );
            if (!result)
                return res
                    .status(404)
                    .json({ error: 'Attendance Students not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
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
            res.status(500).json({ error: error.message });
        }
    },
};
