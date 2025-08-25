const { db } = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

class Exam {
    static async create(ExamData, trx = null) {
        const knexOrTrx = trx || db;
        const shortUuid = (ExamData.uuid || uuidv4())
            .replace(/-/g, '')
            .slice(0, 10);
        const dataWithUuid = {
            ...ExamData,
            uuid: shortUuid,
        };
        return await knexOrTrx('exams').insert(dataWithUuid).returning('*');
    }

    static async findById(id) {
        return await db('exams')
            .where({
                id,
            })
            .first();
    }

    static async findAll() {
        return await db('exams').select('*');
    }

    static async update(id, updates) {
        return await db('exams')
            .where({
                id,
            })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('exams')
            .where({
                id,
            })
            .del();
    }

    static async getExamQuestion(examId) {
        const rows = await db('exams as e')
            .join('exam_question as eq', 'eq.exam_id', 'e.id') // Join through pivot table
            .join('questions as q', 'q.id', 'eq.question_id') // Join to questions
            .leftJoin('options as o', 'o.question_id', 'q.id') // Keep questions even if no options
            .where('e.id', examId)
            .select(
                'e.id as exam_id',
                'e.uuid as exam_uuid',
                'e.title as exam_title',
                'e.total_mark',
                'e.time_limit',
                'e.passing_mark',
                'e.announced',
                'q.id as question_id',
                'q.question_text',
                'eq.mark ', // Get mark from pivot table if it's stored there
                'q.type',
                'o.id as option_id',
                'o.text',
                'o.is_correct'
            );

        // 2️⃣  Build one nested JS object.
        let exam = null;
        const questionMap = {};

        rows.forEach((r) => {
            // Create the exam wrapper once.
            if (!exam) {
                exam = {
                    exam_id: r.exam_id,
                    exam_uuid: r.exam_uuid,
                    exam_title: r.exam_title,
                    total_mark: r.total_mark,
                    passing_mark: r.passing_mark,
                    time_limit: r.time_limit,
                    questions: [],
                };
            }

            // Make sure the current question exists inside the exam.
            if (!questionMap[r.question_id]) {
                const questionObj = {
                    question_id: r.question_id,
                    question_text: r.question_text,
                    questin_mark: r.mark,
                    type: r.type,
                    options: [],
                };
                questionMap[r.question_id] = questionObj;
                exam.questions.push(questionObj);
            }

            // Add an option if the left join found one.
            if (r.option_id) {
                questionMap[r.question_id].options.push({
                    option_id: r.option_id,
                    text: r.text,
                    is_correct: r.is_correct,
                });
            }
        });

        return exam; // if the id didn’t exist this will be null
    }
}

module.exports = Exam;
