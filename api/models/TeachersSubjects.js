const {db} = require('../../config/db');

class TeachersSubjects {
  static async create(TeachersSubjectsData) {
    return await db('teachers_subjects').insert(TeachersSubjectsData).returning('*');
  }

  static async findById(id) {
    return await db('teachers_subjects').where({ id }).first();
  }

  static async findAll() {
    return await db('teachers_subjects').select('*') ;
  }

  static async update(id, updates) {
    return await db('teachers_subjects').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('teachers_subjects').where({ id }).del();
  }
}

module.exports = TeachersSubjects;
