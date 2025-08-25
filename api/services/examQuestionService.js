const ExamQuestion= require('../models/exam_question');

module.exports = {
  async createExamQuestion(ExamQuestionData,trx=null) {
    return await ExamQuestion.create(ExamQuestionData,trx);
  },

  async getExamQuestion(id) {
    return await ExamQuestion.findById(id);
  },

  async getAllExamQuestions() {
    return await ExamQuestion.findAll();
  },

  async updateExamQuestion(id, updates) {
    return await ExamQuestion.update(id, updates);
  },

  async deleteExamQuestion(id) {
    return await ExamQuestion.delete(id);
  },

  async getExamQuestionQuestion(id) {
    return await ExamQuestion.getExamQuestionQuestion(id);
  }
};