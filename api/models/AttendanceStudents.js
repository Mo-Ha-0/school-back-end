const { db } = require('../../config/db');

class AttendanceStudents {
    static async create(AttendanceStudentsData) {
        return await db('attendance_students')
            .insert(AttendanceStudentsData)
            .returning('*');
    }

    static async findById(id) {
        return await db('attendance_students').where({ id }).first();
    }

    static async findAll() {
        return await db('attendance_students').select('*');
    }

    static async update(id, updates) {
        return await db('attendance_students')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('attendance_students').where({ id }).del();
    }

    static async findByStudentId(studentId) {
        return await db('attendance_students')
            .where({ student_id: studentId })
            .orderBy('date', 'desc')
            .limit(30); // Get last 30 attendance records
    }
}

module.exports = AttendanceStudents;
