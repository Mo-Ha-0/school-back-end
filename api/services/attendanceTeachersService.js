const AttendanceTeachers = require('../models/AttendanceTeachers');

module.exports = {
    async createAttendanceTeachers(AttendanceTeachersData) {
        return await AttendanceTeachers.create(AttendanceTeachersData);
    },

    async getAttendanceTeachers(id) {
        return await AttendanceTeachers.findById(id);
    },

    async getAllAttendanceTeachers() {
        return await AttendanceTeachers.findAll();
    },

    async updateAttendanceTeachers(id, updates) {
        return await AttendanceTeachers.update(id, updates);
    },

    async deleteAttendanceTeachers(id) {
        return await AttendanceTeachers.delete(id);
    },

    async getAttendanceTeachersByDate(date) {
        return await AttendanceTeachers.findByDate(date);
    },

    async getAttendanceByTeacherId(teacherId) {
        return await AttendanceTeachers.findByTeacherId(teacherId);
    },
};
