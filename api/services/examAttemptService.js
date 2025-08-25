const ExamAttempt= require('../models/exam_attempt');

module.exports = {
  async createExamAttempt(ExamAttemptData,trx=null) {
    return await ExamAttempt.create(ExamAttemptData,trx);
  },

  async getExamAttempt(id) {
    return await ExamAttempt.findById(id);
  },

  async checkIfStudentTakeAnExam(student_id,exam_id) {
    return await ExamAttempt.checkIfStudentTakeAnExam(student_id,exam_id);
  },

  async getAllExamAttempts() {
    return await ExamAttempt.findAll();
  },

  async updateExamAttempt(id, updates,trx=null) {
    return await ExamAttempt.update(id, updates,trx);
  },

  async deleteExamAttempt(id) {
    return await ExamAttempt.delete(id);
  }
};