const Exam= require('../models/Exam');

module.exports = {
  async createExam(ExamData, trx = null) {
    return await Exam.create(ExamData, trx);
  },

  async getExam(id) {
    return await Exam.findById(id);
  },

  async getAllExams() {
    return await Exam.findAll();
  },

  async updateExam(id, updates) {
    return await Exam.update(id, updates);
  },

  async deleteExam(id) {
    return await Exam.delete(id);
  },

  async getExamQuestion(id) {
    return await Exam.getExamQuestion(id);
  }
};