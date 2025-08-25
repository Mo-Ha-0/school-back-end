const {db} = require('../../config/db');

class Answer {
  static async create(AnswerData,trx=null) {
    const {option_id,question_id}=AnswerData;
    const { exam_id ,...data } = AnswerData;
    const  option= await db('options').where({id:option_id}).first();
    const  questions= await db('exams as e')
    .leftJoin('exam_question as eq', 'eq.exam_id', 'e.id')   // keep qs even if no options
    .where('e.id', exam_id)
    .where('eq.question_id',question_id)
    .select('eq.mark','eq.question_id');
    
  
    const isCorrect=option.is_correct;
    if (questions[0].question_id!=option.question_id) {
      throw new Error('this option not for this question');
    }
      AnswerData={...data,mark_awarded:isCorrect ? questions[0].mark:0};
      
      
    const query = db('answers').insert(AnswerData).returning('*');
    if (trx) query.transacting(trx);
    return query;
  }

  static async findById(id) {
    return await db('answers').where({ id }).first();
  }

  static async findAll() {
    return await db('answers').select('*') ;
  }

  static async update(id, updates) {
    return await db('answers').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('answers').where({ id }).del();
  }
}

module.exports = Answer;
