const Student = require('../models/Student');
const { getSubject } = require('./subjectService');

module.exports = {
    async createStudent(studentData, trx = null) {
        return await Student.create(studentData, trx);
    },

    async getStudent(id) {
        return await Student.findById(id);
    },
    async getCurriculumId(grade_level) {
        return await Student.getCurriculumId(grade_level);
    },
    async findByUserId(id) {
        return await Student.findByUserId(id);
    },
    async findByEmail(email, trx = null) {
        return await Student.findByEmail(email, trx);
    },
    async getAllStudents() {
        return await Student.findAll();
    },

    async updateStudent(id, updates) {
        const studentData = {
            class_id: updates.class_id,
            curriculum_id: updates.curriculum_id,
            grade_level: updates.grade_level,
        };
        const userData = {
            name: updates.name,
            // email: updates.email,
            phone: updates.phone,
            birth_date: updates.birth_date,
        };
        const { student, user } = await Student.update(
            id,
            studentData,
            userData
        );
        return { student, user };
    },

    async deleteStudent(id) {
        return await Student.delete(id);
    },
    async getSubjects(id) {
        return await Student.getSubjects(id);
    },
    async getClass(id) {
        return await Student.getClass(id);
    },
    async getStudentArchive(id) {
        return await Student.getStudentArchive(id);
    },
    async getStudentSchedule(id) {
        return await Student.getStudentSchedule(id);
    },

    async getStudentsByClass(classId) {
        return await Student.findByClassId(classId);
    },
};
