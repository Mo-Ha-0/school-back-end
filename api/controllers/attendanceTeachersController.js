const attendanceTeachersService = require('../services/attendanceTeachersService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');

module.exports = {
    async createAttendanceTeachers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let { date, attendance } = req.body;
            const created_by = req.user.id; // Get the authenticated user's ID

            const attendance_teachers =
                await attendanceTeachersService.getAttendanceTeachersByDate(
                    date
                );
            if (attendance_teachers.length > 0) {
                return res
                    .status(400)
                    .json({ error: 'Attendance already exists' });
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
            res.status(201).json({ attendance: AttendanceTeachers });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.getAttendanceTeachers(
                    req.params.id
                );
            if (!AttendanceTeachers)
                return res
                    .status(404)
                    .json({ error: 'Attendance Teachers not found' });
            res.json(AttendanceTeachers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.getAllAttendanceTeachers();
            res.json(AttendanceTeachers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateAttendanceTeachers(req, res) {
        try {
            const AttendanceTeachers =
                await attendanceTeachersService.updateAttendanceTeachers(
                    req.params.id,
                    req.body
                );
            if (!AttendanceTeachers || AttendanceTeachers.length == 0)
                return res
                    .status(404)
                    .json({ error: 'AttendanceTeachers not found' });
            res.json(AttendanceTeachers);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteAttendanceTeachers(req, res) {
        try {
            const result =
                await attendanceTeachersService.deleteAttendanceTeachers(
                    req.params.id
                );
            if (!result)
                return res
                    .status(404)
                    .json({ error: 'Attendance Teachers not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
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
            res.status(500).json({ error: error.message });
        }
    },
};
