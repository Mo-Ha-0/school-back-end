const Answer= require('../models/Answer');

module.exports = {
  async createAnswer(AnswerData,trx=null) {
    return await Answer.create(AnswerData,trx);
  },

  async getAnswer(id) {
    return await Answer.findById(id);
  },

  async getAllAnswers() {
    return await Answer.findAll();
  },

  async updateAnswer(id, updates) {
    return await Answer.update(id, updates);
  },

  async deleteAnswer(id) {
    return await Answer.delete(id);
  }
};