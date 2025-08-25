const TeachersSubjects= require('../models/TeachersSubjects');

module.exports = {
  async createTeachersSubjects(TeachersSubjectsData) {
    return await TeachersSubjects.create(TeachersSubjectsData);
  },

  async getTeachersSubjects(id) {
    return await TeachersSubjects.findById(id);
  },

  async getAllTeachersSubjects() {
    return await TeachersSubjects.findAll();
  },

  async updateTeachersSubjects(id, updates) {
    return await TeachersSubjects.update(id, updates);
  },

  async deleteTeachersSubjects(id) {
    return await TeachersSubjects.delete(id);
  }
};