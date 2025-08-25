const { db } = require('../../config/db');
const academic_year = require('./academic_year');

class Archive {
    static async create(ArchiveData, trx = null) {
        const knexOrTrx = trx || db;
        return await knexOrTrx('archives').insert(ArchiveData).returning('*');
    }

    static async findById(id) {
        return await db('archives').where({ id }).first();
    }

    static async findByAcademicYearId(id,student_id) {
        return await db('archives').where({ academic_year_id:id,student_id }).first();
    }

    static async findAll() {
        return await db('archives').select('*');
    }

    static async update(id, updates) {
        return await db('archives')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('archives').where({ id }).del();
    }
}

module.exports = Archive;
