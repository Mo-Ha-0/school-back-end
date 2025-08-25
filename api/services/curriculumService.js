const  Curriculum= require('../models/Curriculum');

module.exports = {
  async createCurriculum(CurriculumData) {
    return await Curriculum.create(CurriculumData);
  },

  async getCurriculum(id) {
    return await Curriculum.findById(id);
  },

  async getAllCurriculumes() {
    return await Curriculum.findAll();
  },

  async updateCurriculum(id, updates) {
    return await Curriculum.update(id, updates);
  },

  async deleteCurriculum(id) {
    return await Curriculum.delete(id);
  }
};