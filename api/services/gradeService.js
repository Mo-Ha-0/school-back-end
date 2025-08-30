const Grade = require('../models/Grade');

module.exports = {
    async createGrade(GradeData, trx = null) {
        return await Grade.create(GradeData, trx);
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
    },

    async getStudentArchiveForCurrentYear(studentId) {
        const today = new Date().toISOString().split('T')[0];

        // Find student archive for current academic year
        const archive = await Grade.findStudentArchiveForCurrentYear(
            studentId,
            today
        );
        return archive;
    },
};
