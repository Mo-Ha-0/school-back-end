const { db } = require('../../config/db');

class Behavior {
    static async create(behaviorData) {
        return await db('behaviors').insert(behaviorData).returning('*');
    }

    static async findById(id) {
        return await db('behaviors').where({ id }).first();
    }

    static async findAll() {
        return await db('behaviors').select('*').orderBy('date', 'desc');
    }

    static async update(id, updates) {
        return await db('behaviors')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('behaviors').where({ id }).del();
    }

    static async findByStudentId(studentId) {
        return await db('behaviors')
            .where({ student_id: studentId })
            .orderBy('date', 'desc');
    }
}

module.exports = Behavior;
