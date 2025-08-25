const {db} = require('../../config/db');

class ExamQuestion {
  static async create(ExamqQuestionData, trx) {
    const { mark, exam_id } = ExamqQuestionData;
    
    const exam = await db('exams').where({ id: exam_id }).first().transacting(trx);

    const result = await db('questions')
        .join('exam_question', 'questions.id', 'exam_question.question_id')
        .where('exam_question.exam_id', exam_id)
        .sum('exam_question.mark as total')
        .first()
        .transacting(trx);

    const currentTotal = result.total || 0;
    const maxAllowedMark = exam.total_mark - currentTotal;
    
    if (mark > maxAllowedMark) {
        throw new Error(`Total question marks would exceed exam mark (${exam.total_mark})`);
    }
    
    return await db('exam_question')
        .insert(ExamqQuestionData)
        .returning('*')
        .transacting(trx);
}
  static async findById(id) {
    return await db('exam_question').where({ id }).first();
  }

  static async findAll() {
    return await db('exam_question').select('*') ;
  }

  static async update(id, updates) {
    if (updates.mark) {
      const { mark } = updates;
      const examQuestion=await db('exam_question').where({ id: id }).first();
      const exam_id=examQuestion.exam_id;
      const exam = await db('exams').where({ id: exam_id }).first();
      
      const result = await db('questions')
          .join('exam_question', 'questions.id', 'exam_question.question_id')
          .where('exam_question.exam_id', exam_id)
          .sum('exam_question.mark as total')
          .first()
          ;
  
      const currentTotal = result.total || 0;
        const currentQuestionMark = await db('exam_question')
          .where({ exam_id: exam.id, question_id: examQuestion.question_id })
          .first()
          .then(row => row.mark ); // Use existing mark if pivot has no override
  
        const maxAllowedMark = (exam.total_mark - currentTotal) + currentQuestionMark;
        
        if (mark > maxAllowedMark) {
          throw new Error(`Total question marks would exceed exam mark (${exam.total_mark}) for exam ${exam.id}`);
        }

    }
    return await db('exam_question').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('exam_question').where({ id }).del();
  }

  // static async getExamQuestion(examId) {
  //   const rows = await db('exam_question as e')
  //   .join('exam_question as eq', 'eq.exam_id', 'e.id')  // Join through pivot table
  //   .join('questions as q', 'q.id', 'eq.question_id')   // Join to questions
  //   .leftJoin('options as o', 'o.question_id', 'q.id')  // Keep questions even if no options
  //   .where('e.id', examId)
  //   .select(
  //     'e.id as exam_id',
  //     'e.title as exam_title',
  //     'e.total_mark',
  //     'e.time_limit',
  //     'e.passing_mark',
  //     'q.id as question_id',
  //     'q.question_text',
  //     'eq.mark ', // Get mark from pivot table if it's stored there
  //     'q.type',
  //     'o.id as option_id',
  //     'o.text',
  //     'o.is_correct'
  //   );

  //   // 2️⃣  Build one nested JS object.
  //   let exam = null;
  //   const questionMap = {};

  //   rows.forEach(r => {
  //     // Create the exam wrapper once.
  //     if (!exam) {
  //       exam = {
  //         exam_id: r.exam_id,
  //         exam_title: r.exam_title,
  //         total_mark:r.total_mark,
  //         passing_mark:r.passing_mark,
  //         time_limit:r.time_limit,
  //         questions: []
  //       };
  //     }

  //     // Make sure the current question exists inside the exam.
  //     if (!questionMap[r.question_id]) {
  //       const questionObj = {
  //         question_id:   r.question_id,
  //         question_text: r.question_text,
  //         questin_mark:r.mark,
  //         type:r.type,
  //         options: []
  //       };
  //       questionMap[r.question_id] = questionObj;
  //       exam.questions.push(questionObj);
  //     }

  //     // Add an option if the left join found one.
  //     if (r.option_id) {
  //       questionMap[r.question_id].options.push({
  //         option_id:  r.option_id,
  //         text:  r.text,
  //         is_correct: r.is_correct
  //       });
  //     }
  //   });

  //   return exam;   // if the id didn’t exist this will be null
  // }
}

module.exports = ExamQuestion;
