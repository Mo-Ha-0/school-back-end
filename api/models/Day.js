const {db} = require('../../config/db');

class Day {
  static async create(dayData) {
    return await db('days').insert(dayData).returning('*');
  }

  static async findById(id) {
    return await db('days').where({ id }).first();
  }

  static async findAll() {
    return await db('days').select('*') ;
  }

  static async update(id, updates) {
    return await db('days').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('days').where({ id }).del();
  }
}

module.exports = Day;
