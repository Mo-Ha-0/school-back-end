const Question = require('../models/Question');

module.exports = {
  async createQuestion(QuestionData,trx=null) {
    return await Question.create(QuestionData,trx);
  },

  async getQuestion(id) {
    return await Question.findById(id);
  },

  async getAllQuestions() {
    return await Question.findAll();
  },

  async getExamQuestions() {
    return await Question.getExamQuestions();
  },

  async updateQuestion(id, updates) {
    return await Question.update(id, updates);
  },

  async deleteQuestion(id) {
    return await Question.delete(id);
  },
};
