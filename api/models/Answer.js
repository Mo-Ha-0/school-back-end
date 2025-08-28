const { db } = require('../../config/db');

class Answer {
    static async create(AnswerData, trx = null) {
        const { option_id, question_id, exam_attempt_id } = AnswerData;

        // Get the option and validate it belongs to the question
        const option = await db('options').where({ id: option_id }).first();
        if (!option) {
            throw new Error('Option not found');
        }

        // Validate that the option belongs to the question
        if (option.question_id != question_id) {
            throw new Error('This option does not belong to this question');
        }

        // Get the question's mark from exam_question table
        const examQuestion = await db('exam_question')
            .where({ question_id: question_id })
            .first();

        if (!examQuestion) {
            throw new Error('Question not found in exam');
        }

        // Calculate mark based on whether answer is correct
        const isCorrect = option.is_correct;
        const mark_awarded = isCorrect ? examQuestion.mark : 0;

        // Prepare data for insertion (only the fields that exist in answers table)
        const insertData = {
            question_id,
            option_id,
            exam_attempt_id,
            mark_awarded,
        };

        const query = db('answers').insert(insertData).returning('*');
        if (trx) query.transacting(trx);
        return query;
    }

    static async findById(id) {
        return await db('answers').where({ id }).first();
    }

    static async findAll() {
        return await db('answers').select('*');
    }

    static async update(id, updates) {
        return await db('answers').where({ id }).update(updates).returning('*');
    }

    static async delete(id) {
        return await db('answers').where({ id }).del();
    }
}

module.exports = Answer;
