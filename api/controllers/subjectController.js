const subjectService = require('../services/subjectService');
const { db } = require('../../config/db');

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createSubject(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { level_grade } = req.body;
            const curriculum = await db('curriculums')
                .select('*')
                .where({ level_grade: String(level_grade), is_active: true })
                .first();
            if (!curriculum) {
                return res.status(404).json({
                    error: 'Curriculum not found for provided level_grade',
                });
            }

            req.body.curriculum_id = curriculum.id;
            delete req.body.level_grade;

            const Subject = await subjectService.createSubject(req.body);
            res.status(201).json(Subject);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getSubject(req, res) {
        try {
            const Subject = await subjectService.getSubject(req.params.id);
            if (!Subject)
                return res.status(404).json({ error: 'Subject not found' });
            res.json(Subject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSubjectes(req, res) {
        try {
            const Subject = await subjectService.getAllSubjectes();
            res.json(Subject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSubjectesOfStudent(req, res) {
        const userId = req.user.id;
        try {
            const studentCurriculum = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!studentCurriculum) {
                return res
                    .status(404)
                    .json({ error: 'Student record not found for this user' });
            }
            const subjects = await db('subjects')
                .select('*')
                .where({ curriculum_id: studentCurriculum.curriculum_id });

            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateSubject(req, res) {
        try {
            const { level_grade } = req.body || {};

            if (level_grade !== undefined) {
                const curriculum = await db('curriculums')
                    .select('*')
                    .where({
                        level_grade: String(level_grade),
                        is_active: true,
                    })
                    .first();
                if (!curriculum) {
                    return res.status(404).json({
                        error: 'Curriculum not found for provided level_grade',
                    });
                }

                req.body.curriculum_id = curriculum.id;
                delete req.body.level_grade;
            }

            const Subject = await subjectService.updateSubject(
                req.params.id,
                req.body
            );
            if (!Subject || Subject.length == 0)
                return res.status(404).json({ error: 'Subject not found' });
            res.json(Subject);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteSubject(req, res) {
        try {
            const result = await subjectService.deleteSubject(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Subject not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSubjectsList(req, res) {
        try {
            const Subjects = await subjectService.getAllSubjectsNames();

            res.json(Subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
