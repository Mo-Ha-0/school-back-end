const {db} = require('../../config/db');

class semester {
  static async create(semesterData) {
    return await db('semesters').insert(semesterData).returning('*');
  }

  static async findById(id) {
    return await db('semesters').where({ id }).first();
  }

  static async findByAcademicYearId(id) {
    return await db('semesters').where({ academic_year_id:id }).first();
  }

  static async findAll() {
    return await db('semesters').select('*') ;
  }

  static async update(id, updates) {
    return await db('semesters').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('semesters').where({ id }).del();
  }


}

module.exports = semester;