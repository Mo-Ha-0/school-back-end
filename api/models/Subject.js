const { db } = require('../../config/db');

class Subject {
    static async create(SubjectData) {
        return await db('subjects').insert(SubjectData).returning('*');
    }

    static async findById(id) {
        return await db('subjects').where({ id }).first();
    }

    static async findAll() {
        return await db('subjects')
            .join('curriculums', 'subjects.curriculum_id', 'curriculums.id')
            .select(
                'subjects.id',
                'subjects.name',
                'subjects.curriculum_id',
                'curriculums.level_grade as grade'
            );
    }

    static async update(id, updates) {
        return await db('subjects')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('subjects').where({ id }).del();
    }

    static async findAllNames() {
        return await db('subjects').select('id', 'name');
    }
}

module.exports = Subject;
