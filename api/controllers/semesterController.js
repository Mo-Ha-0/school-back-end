const semesterService = require('../services/semesterService');
const { db } = require('../../config/db');
const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createSemester(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Semester = await semesterService.createSemester(req.body);
            res.status(201).json(Semester);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getSemester(req, res) {
        try {
            const Semester = await semesterService.getSemester(req.params.id);
            if (!Semester)
                return res.status(404).json({ error: 'Semester not found' });
            res.json(Semester);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSemesters(req, res) {
        try {
            const Semester = await semesterService.getAllSemesters();
            res.json(Semester);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateSemester(req, res) {
        try {
            const Semester = await semesterService.updateSemester(
                req.params.id,
                req.body
            );
            if (!Semester || Semester.length == 0)
                return res.status(404).json({ error: 'Semester not found' });
            res.json(Semester);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteSemester(req, res) {
        try {
            const result = await semesterService.deleteSemester(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Semester not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getsemestersBySubject(req, res) {
        const { subject_id } = req.params;
        const userId = req.user.id;
        try {
            // Check if any exams exist for this subject
            const examExists = await db('exams').where({ subject_id }).first();
            if (!examExists) {
                return res.json('There are no exams for this subject');
            }

            // 1. Get the student's curriculum
            const student = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!student) {
                return res
                    .status(404)
                    .json({ error: 'Student record not found for this user' });
            }

            // 2. Get the curriculum of the subject
            const subject = await db('subjects')
                .select('curriculum_id')
                .where({ id: subject_id })
                .first();

            if (!subject) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            // 3. Make sure the curriculum matches
            if (student.curriculum_id !== subject.curriculum_id) {
                return res.status(403).json({
                    error: 'Student curriculum does not match subject curriculum',
                });
            }

            // Get distinct semesters with valid exams
            const semesters = await db('exams')
                .join('semesters', 'exams.semester_id', 'semesters.id')
                .distinct('semesters.id', 'semesters.semester_name')
                .where('exams.subject_id', subject_id)
                .where('exams.end_datetime', '<=', db.fn.now())
                .select('semesters.semester_name');

            if (semesters.length === 0) {
                return res.json('There are no valid exams for this subject');
            }

            res.json(semesters);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // async getStudentsInAcademicYear(req, res) {
    //   try {
    //     const AcademicYearExists = await academicYearService.getAcademicYear(req.body.id);
    //     if (!AcademicYearExists) return res.status(404).json({ error: 'AcademicYear not found' });
    //     const Students = await academicYearService.getStudentsInAcademicYear(req.body.id);
    //     if (!Students) return res.status(404).json({ error: 'Students not found' });
    //     res.json(Students);
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // },
};
