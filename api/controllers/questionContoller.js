const { db } = require('../../config/db');
const examService = require('../services/examService');
const qustionService = require('../services/qustionService');
const optionService = require('../services/optionService');
const { validationResult, body } = require('express-validator');

module.exports = {
  async createQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {question_text,subject_id,type,options}=req.body;
      const result = await db.transaction(async (trx) => {

        const Question = await qustionService.createQuestion({question_text,subject_id,type},trx);

        const addedOptions= options.map((option)=>({text:option.text,
          is_correct:option.is_correct,question_id:Question[0].id
        }));

        const Options= await optionService.createOption(addedOptions,trx);
        return {Question,Options};
      });
     
     
      
   
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getQuestion(req, res) {
    try {
      const Question = await qustionService.getQuestion(req.params.id);
      if (!Question)
        return res.status(404).json({ error: 'Question not found' });
      res.json(Question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllQuestions(req, res) {
    try {
      const Questions = await qustionService.getAllQuestions();
      res.json(Questions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getExamQuestions(req, res) {
    try {
      const { exam_id } = req.params;
      const exam = await examService.getExam(exam_id);
      const exam_question = await db('exam_question')
        .select('*')
        .where({ exam_id });

      const question_ids = await exam_question.map((el) => el.question_id);

      var questions = await db('questions')
        .whereIn('id', question_ids)
        .select('id', 'question_text', 'type', 'subject_id');

      const subjectIds = [...new Set(questions.map((q) => q.subject_id))];

      const subjects = await db('subjects')
        .whereIn('id', subjectIds)
        .select('id', 'name');

      const subjectMap = subjects.reduce((map, subject) => {
        map[subject.id] = subject.name;
        return map;
      }, {});

      const questionsWithSubjects = questions.map((question) => ({
        ...question,
        subject_name: subjectMap[question.subject_id] || null,
      }));

      res.json({ questions: questionsWithSubjects });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateQuestion(req, res) {
    try {
      const Question = await qustionService.updateQuestion(
        req.params.id,
        req.body
      );
      if (!Question | (Question.length == 0))
        return res.status(404).json({ error: 'Question not found' });
      res.json(Question);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteQuestion(req, res) {
    try {
      const result = await qustionService.deleteQuestion(req.params.id);
      if (!result) return res.status(404).json({ error: 'Question not found' });
      res.status(200).json({ message: 'deleted successfuly' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
