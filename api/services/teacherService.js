const Teacher = require('../models/Teacher');

module.exports = {
    async createTeacher(teacherData, trx = null) {
        return await Teacher.create(teacherData, trx);
    },
    async attachSubjects(teacherId, subjectIds, trx = null) {
        return await Teacher.attachSubjects(teacherId, subjectIds, trx);
    },

    async getTeacher(id) {
        return await Teacher.findByIdDetailed(id);
    },

    async findByUserId(id) {
        return await Teacher.findByUserId(id);
    },

    async getAllTeachers() {
        return await Teacher.findAllDetailed();
    },

    async updateTeacher(id, updates) {
        return await Teacher.update(id, updates);
    },

    async deleteTeacher(id) {
        return await Teacher.delete(id);
    },

    async clearAndAttachSubjects(teacherId, subjectIds, trx = null) {
        await Teacher.clearSubjects(teacherId, trx);
        if (Array.isArray(subjectIds) && subjectIds.length > 0) {
            return await Teacher.attachSubjects(teacherId, subjectIds, trx);
        }
        return [];
    },

    async getSubjects(id) {
        return await Teacher.getSubjects(id);
    },

    async getTeacherSchedule(id) {
        return await Teacher.getTeacherSchedule(id);
    },

    async getQuestions(id) {
        return await Teacher.getQuestions(id);
    },

    async getStudents(id) {
        return await Teacher.getStudents(id);
    },

    async getClassesByTeacher(id) {
        return await Teacher.getClassesByTeacher(id);
    },
};
