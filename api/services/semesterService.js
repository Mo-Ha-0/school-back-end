const  semester= require('../models/semester');

module.exports = {
  async createSemester(semesterData) {
    return await semester.create(semesterData);
  },

  async getSemester(id) {
    return await semester.findById(id);
  },

  async getAllSemesters() {
    return await semester.findAll();
  },

  async updateSemester(id, updates) {
    return await semester.update(id, updates);
  },

  async deleteSemester(id) {
    return await semester.delete(id);
  },
  // async getStudentsInAcademicYear(id) {
  //   return await academic_year.getStudentsInClass(id);
  // },
 
};