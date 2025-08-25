const  Grade= require('../models/Grade');

module.exports = {
  async createGrade(GradeData,trx=null) {
    return await Grade.create(GradeData,trx);
  },

  async getGrade(id) {
    return await Grade.findById(id);
  },

  async getAllGradees() {
    return await Grade.findAll();
  },

  async findAllForStudent(id) {
    return await Grade.findAllForStudent(id);
  },

  async updateGrade(id, updates) {
    return await Grade.update(id, updates);
  },

  async deleteGrade(id) {
    return await Grade.delete(id);
  }
};