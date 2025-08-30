const semester = require('../models/semester');

module.exports = {
    async createSemester(semesterData) {
        return await semester.create(semesterData);
    },

    async getSemester(id) {
        return await semester.findById(id);
    },

    async findByAcademicYearId(id) {
        return await semester.findByAcademicYearId(id);
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

    async getCurrentSemester() {
        const today = new Date().toISOString().split('T')[0];

        // Get current semester based on current date
        const currentSemester = await semester.findCurrentSemester(today);
        return currentSemester;
    },
    // async getStudentsInAcademicYear(id) {
    //   return await academic_year.getStudentsInClass(id);
    // },
};
