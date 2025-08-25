const  AttendancEmployees= require('../models/AttendancEmployees');

module.exports = {
  async createAttendancEmployees(AttendancEmployeesData) {
    return await AttendancEmployees.create(AttendancEmployeesData);
  },

  async getAttendancEmployees(id) {
    return await AttendancEmployees.findById(id);
  },

  async getAllAttendancEmployees() {
    return await AttendancEmployees.findAll();
  },

  async updateAttendancEmployees(id, updates) {
    return await AttendancEmployees.update(id, updates);
  },

  async deleteAttendancEmployees(id) {
    return await AttendancEmployees.delete(id);
  },

 
};