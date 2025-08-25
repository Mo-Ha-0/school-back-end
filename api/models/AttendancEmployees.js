const {db} = require('../../config/db');

class AttendanceEmployees {
  static async create(AttendanceEmployeesData) {
    return await db('attendance_employees').insert(AttendanceEmployeesData).returning('*');
  }

  static async findById(id) {
    return await db('attendance_employees').where({ id }).first();
  }

  static async findAll() {
    return await db('attendance_employees').select('*') ;
  }

  static async update(id, updates) {
    return await db('attendance_employees').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('attendance_employees').where({ id }).del();
  }

 
}

module.exports = AttendanceEmployees;