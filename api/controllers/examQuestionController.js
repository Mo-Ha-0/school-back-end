const examQuestionService = require('../services/examQuestionService');
const { validationResult } = require('express-validator');

module.exports = {
    async createExamQuestion(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {db} = require('../../config/db');
        const { questions, exam_id } = req.body;
        const trx = await db.transaction();
        
        try {
            const results = [];
            
            for (const question of questions) {
                const ExamQuestion = await examQuestionService.createExamQuestion({
                    question_id: question.question_id,
                    mark: question.mark,
                    exam_id: exam_id
                }, trx);
                
                results.push(ExamQuestion[0]);
            }
            
            await trx.commit();
            res.status(201).json(results);
        } catch (error) {
            await trx.rollback();
            res.status(400).json({ error: error.message });
        }
    },

    async getExamQuestion(req, res) {
        try {
            const ExamQuestion = await examQuestionService.getExamQuestion(req.params.id);
            if (!ExamQuestion) return res.status(404).json({ error: 'ExamQuestion not found' });
            res.json(ExamQuestion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllExamQuestions(req, res) {
        try {
            const ExamQuestions = await examQuestionService.getAllExamQuestions();
            res.json(ExamQuestions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateExamQuestion(req, res) {
        try {
            const ExamQuestion = await examQuestionService.updateExamQuestion(req.params.id, req.body);
            if (!ExamQuestion||ExamQuestion.length==0) return res.status(404).json({ error: 'ExamQuestion not found' });
            res.json(ExamQuestion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteExamQuestion(req, res) {
        try {
            const result = await examQuestionService.deleteExamQuestion(req.params.id);
            if (!result) return res.status(404).json({ error: 'ExamQuestion not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // async getExamQuestionQuestion(req, res) {
    //     try {
    //       const ExamQuestion = await examQuestionService.getExamQuestion(req.body.id);
    //       if(!ExamQuestion) return res.status(404).json({error:'ExamQuestion Not found'});
    //         const result = await ExamQuestionService.getExamQuestionQuestion(req.body.id);
    //         if (!result) return res.status(404).json({ error: 'ExamQuestion questions not found' });
    //         res.json(result);
    //     } catch (error) {
    //         res.status(400).json({ error: error.message });
    //     }
    // },
};