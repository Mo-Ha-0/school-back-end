const Subject = require('../models/Subject');

module.exports = {
    async createSubject(SubjectData) {
        return await Subject.create(SubjectData);
    },

    async getSubject(id) {
        return await Subject.findById(id);
    },

    async getAllSubjectes() {
        return await Subject.findAll();
    },

    async updateSubject(id, updates) {
        return await Subject.update(id, updates);
    },

    async deleteSubject(id) {
        return await Subject.delete(id);
    },

    async getAllSubjectsNames() {
        return await Subject.findAllNames();
    },
};
