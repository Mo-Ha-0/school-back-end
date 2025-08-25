const Class = require('../models/Class');

module.exports = {
    async createClass(classData) {
        return await Class.create(classData);
    },

    async getClass(id) {
        return await Class.findById(id);
    },

    async getAllClasses() {
        return await Class.findAll();
    },

    async getClassesGroupedByGrade() {
        return await Class.getClassesGroupedByGrade();
    },

    async updateClass(id, updates) {
        return await Class.update(id, updates);
    },

    async deleteClass(id) {
        return await Class.delete(id);
    },

    async canDeleteClass(id) {
        return await Class.canDelete(id);
    },

    async getStudentsInClass(id) {
        return await Class.getStudentsInClass(id);
    },
    async getClassSchedule(id) {
        return await Class.getClassSchedule(id);
    },
    async getClassSubjectsWithTeachers(id) {
        return await Class.getClassSubjectsWithTeachers(id);
    },
};
