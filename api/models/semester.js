const {db} = require('../../config/db');

class semester {
  static async create(semesterData) {
    return await db('semesters').insert(semesterData).returning('*');
  }

  static async findById(id) {
    return await db('semesters').where({ id }).first();
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

  // static async getStudentsInClass(id) {
  //   return await db('academic_years as c')
  //   .join('students as s', 's.class_id', 'c.id')
  //   .where('c.id', id)  // Changed from where({id:id}) to be more explicit
  //   .select('s.*');
  // }
}

module.exports = semester;