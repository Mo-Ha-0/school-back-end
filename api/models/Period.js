const {db} = require('../../config/db');

class Period {
  static async create(periodData) {
    return await db('periods').insert(periodData).returning('*');
  }

  static async findById(id) {
    return await db('periods').where({ id }).first();
  }

  static async findAll() {
    return await db('periods').select('*') ;
  }

  static async update(id, updates) {
    return await db('periods').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('periods').where({ id }).del();
  }
}

module.exports = Period;
