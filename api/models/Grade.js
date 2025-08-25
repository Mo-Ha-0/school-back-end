const {db} = require('../../config/db');

class Grade {
  static async create(curriculumData) {
    return await db('grades').insert(curriculumData).returning('*');
  }

  static async findById(id) {
    return await db('grades').where({ id }).first();
  }

  static async findAll() {
    return await db('grades').select('*') ;
  }

  static async update(id, updates) {
    return await db('grades').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('grades').where({ id }).del();
  }
}

module.exports = Grade;