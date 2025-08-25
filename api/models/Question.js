const { db } = require('../../config/db');

class Question {
  static async create(questionData,trx=null) {
    const query =db('questions');
    if (trx) query.transacting(trx);
    return await query.insert(questionData).returning('*');
  }

  static async findById(id) {
    return await db('questions').where({ id }).first();
  }

  static async findAll() {
    return await db('questions').select('*');
  }

  static async getExamQuestions(exam_id) {
    console.log('object');
    return await db('questions').select('*').where({ exam_id });
  }

  static async update(id, updates) {
    return await db('questions').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('questions').where({ id }).del();
  }
}

module.exports = Question;
