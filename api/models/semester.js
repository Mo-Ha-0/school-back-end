const { db } = require('../../config/db');

class semester {
    static async create(semesterData) {
        return await db('semesters').insert(semesterData).returning('*');
    }

    static async findById(id) {
        return await db('semesters').where({ id }).first();
    }

    static async findByAcademicYearId(id) {
        return await db('semesters').where({ academic_year_id: id }).first();
    }

    static async findAll() {
        return await db('semesters').select('*');
    }

    static async update(id, updates) {
        return await db('semesters')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('semesters').where({ id }).del();
    }

    static async findCurrentSemester(currentDate) {
        // Find the current semester by joining with academic_years table
        // and checking if the current date falls within the academic year
        const currentSemester = await db('semesters')
            .join(
                'academic_years',
                'semesters.academic_year_id',
                'academic_years.id'
            )
            .where('academic_years.start_year', '<=', currentDate)
            .andWhere('academic_years.end_year', '>=', currentDate)
            .select('semesters.*')
            .orderBy('semesters.id', 'asc')
            .first();

        return currentSemester;
    }
}

module.exports = semester;
