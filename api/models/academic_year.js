const {db} = require('../../config/db');

class academic_year {
  static async create(academicYearData) {
    return await db('academic_years').insert(academicYearData).returning('*');
  }

  static async findById(id) {
    return await db('academic_years').where({ id }).first();
  }

  static async findAllAccordingYearNow() {
    const now = new Date();
     
    return await db('academic_years')
      .select('*')
      .where('start_year', '<=', now)
      .andWhere('end_year', '>=', now).first();
  }

  static async findAll() {
    return await db('academic_years').select('*') ;
  }

  static async update(id, updates) {
    return await db('academic_years').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('academic_years').where({ id }).del();
  }

  // static async getStudentsInClass(id) {
  //   return await db('academic_years as c')
  //   .join('students as s', 's.class_id', 'c.id')
  //   .where('c.id', id)  // Changed from where({id:id}) to be more explicit
  //   .select('s.*');
  // }
}

module.exports = academic_year;