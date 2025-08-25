const {db} = require('../../config/db');

class Class {
  static async create(curriculumData) {
    return await db('curriculums').insert(curriculumData).returning('*');
  }

  static async findById(id) {
    return await db('curriculums').where({ id }).first();
  }

  static async findAll() {
    return await db('curriculums').select('*') ;
  }

  static async update(id, updates) {
    return await db('curriculums').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('curriculums').where({ id }).del();
  }
}

module.exports = Class;