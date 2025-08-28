const AttendanceEmployees = require('../models/AttendancEmployees');

module.exports = {
    async createAttendanceEmployees(AttendanceEmployeesData) {
        return await AttendanceEmployees.create(AttendanceEmployeesData);
    },

    async getAttendanceEmployees(id) {
        return await AttendanceEmployees.findById(id);
    },

    async getAllAttendanceEmployees() {
        return await AttendanceEmployees.findAll();
    },

    async updateAttendanceEmployees(id, updates) {
        return await AttendanceEmployees.update(id, updates);
    },

    async deleteAttendanceEmployees(id) {
        return await AttendanceEmployees.delete(id);
    },

    async getAttendanceEmployeesByDate(date) {
        return await AttendanceEmployees.findByDate(date);
    },

    async getAttendanceByEmployeeId(employeeId) {
        return await AttendanceEmployees.findByEmployeeId(employeeId);
    },
};
