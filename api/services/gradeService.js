const  Grade= require('../models/Grade');

module.exports = {
  async createGrade(GradeData) {
    return await Grade.create(GradeData);
  },

  async getGrade(id) {
    return await Grade.findById(id);
  },

  async getAllGradees() {
    return await Grade.findAll();
  },

  async updateGrade(id, updates) {
    return await Grade.update(id, updates);
  },

  async deleteGrade(id) {
    return await Grade.delete(id);
  }
};