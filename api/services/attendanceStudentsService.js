const AttendanceStudents = require('../models/AttendanceStudents');

module.exports = {
    async createAttendanceStudents(AttendanceStudentsData) {
        return await AttendanceStudents.create(AttendanceStudentsData);
    },

    async getAttendanceStudents(id) {
        return await AttendanceStudents.findById(id);
    },

    async getAllAttendanceStudents() {
        return await AttendanceStudents.findAll();
    },

    async updateAttendanceStudents(id, updates) {
        return await AttendanceStudents.update(id, updates);
    },

    async deleteAttendanceStudents(id) {
        return await AttendanceStudents.delete(id);
    },

    async getAttendanceByStudentId(studentId) {
        return await AttendanceStudents.findByStudentId(studentId);
    },
};
