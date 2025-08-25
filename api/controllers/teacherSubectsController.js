const teacherSubjectsSubjects = require('../services/teacherSubjectsSubjects');
const { validationResult } = require('express-validator');

module.exports = {
    async createTeachersSubects(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const TeachersSubects = await teacherSubjectsSubjects.createTeachersSubjects(req.body);
            res.status(201).json(TeachersSubects);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getTeachersSubects(req, res) {
        try {
            const TeachersSubects = await teacherSubjectsSubjects.getTeachersSubjects(req.params.id);
            if (!TeachersSubects) return res.status(404).json({ error: 'TeachersSubects not found' });
            res.json(TeachersSubects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllTeachersSubectss(req, res) {
        try {
            const TeachersSubects = await teacherSubjectsSubjects.getAllTeachersSubjects();
            res.json(TeachersSubects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateTeachersSubects(req, res) {
        try {
            const TeachersSubects = await teacherSubjectsSubjects.updateTeachersSubjects(req.params.id, req.body);
            if (!TeachersSubects) return res.status(404).json({ error: 'TeachersSubects not found' });
            res.json(TeachersSubects);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteTeachersSubects(req, res) {
        try {
            const result = await teacherSubjectsSubjects.deleteTeachersSubjects(req.params.id);
            if (!result) return res.status(404).json({ error: 'TeachersSubects not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};