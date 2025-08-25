const {db} = require('../../config/db');

class ExamAttempt {
  static async create(ExamAttemptData,trx=null) {
    const query = db('exam_attempts').insert(ExamAttemptData).returning('*');
    if (trx) query.transacting(trx);
    return query;
  }

  static async findById(id) {
    return await db('exam_attempts').where({ id }).first();
  }


  static async findAll() {
    return await db('exam_attempts').select('*') ;
  }
  static async checkIfStudentTakeAnExam(student_id,exam_id) {
    return await db('exam_attempts')
    .where({ 
        exam_id: exam_id,
        student_id: student_id 
    })
    .first();
  }
 
  static async update(id, updates,trx=null) {
    const query =db('exam_attempts');
    if (trx) query.transacting(trx);
    return await query.where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('exam_attempts').where({ id }).del();
  }
}

module.exports = ExamAttempt;
