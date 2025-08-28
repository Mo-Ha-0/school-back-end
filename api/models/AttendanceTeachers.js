const { db } = require('../../config/db');

class AttendanceTeachers {
    static async create(AttendanceTeachersData) {
        return await db('attendance_teachers')
            .insert(AttendanceTeachersData)
            .returning('*');
    }

    static async findById(id) {
        return await db('attendance_teachers').where({ id }).first();
    }

    static async findAll() {
        return await db('attendance_teachers').select('*');
    }

    static async update(id, updates) {
        return await db('attendance_teachers')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('attendance_teachers').where({ id }).del();
    }

    static async findByDate(date) {
        return await db('attendance_teachers').where({ date }).select('*');
    }

    static async findByTeacherId(teacherId) {
        return await db('attendance_teachers')
            .where({ teacher_id: teacherId })
            .orderBy('date', 'desc')
            .limit(30); // Get last 30 attendance records
    }
}

module.exports = AttendanceTeachers;
