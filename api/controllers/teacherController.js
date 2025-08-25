const teacherService = require('../services/teacherService');
const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const roleService = require('../services/roleService');

const bcrypt = require('bcrypt-nodejs');
const { getSubject } = require('./subjectController');
const { toDateOnly } = require('../utils/dateUtils');
module.exports = {
    async createTeacher(req, res) {
        try {
            const { db } = require('../../config/db');
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const {
                name,
                email,
                phone,
                birth_date,
                specialization,
                hire_date,
                qualification,
                subject_ids,
            } = req.body;
            const password = userService.generateRandomPassword();

            const hash = bcrypt.hashSync(password);
            const role = await roleService.getRoleByName('teacher');
            if (!role || role.length == 0) {
                return res
                    .status(400)
                    .json({ msg: 'there is no role for teacher' });
            }

            const result = await db.transaction(async (trx) => {
                // Create user within transaction
                const user = await userService.createUser(
                    {
                        name: name,
                        birth_date: birth_date,
                        email: email,
                        phone: phone,
                        role_id: role[0].id,
                        password_hash: hash,
                    },
                    trx
                );
                //             if (user[0]) {
                //                 const sendMessage = await userService.sendWhatsAppMessage(
                //                     user[0].phone,
                //                     `your email is : ${email}
                //   and password is:
                //   ${password}`
                //                 );
                //                 console.log(sendMessage);
                //             }
                // Create student within the same transaction
                const Teacher = await teacherService.createTeacher(
                    {
                        user_id: user[0].id,
                        specialization: specialization,
                        hire_date: hire_date,
                        qualification: qualification,
                    },
                    trx
                );

                if (Array.isArray(subject_ids) && subject_ids.length > 0) {
                    await teacherService.attachSubjects(
                        Teacher[0].id,
                        subject_ids,
                        trx
                    );
                }

                return Teacher;
            });

            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({
                error: error.message,
                msg: 'Failed to create student. All changes rolled back.',
            });
        }
    },

    async getTeacher(req, res) {
        try {
            const teacher = await teacherService.getTeacher(req.params.id);
            if (!teacher)
                return res.status(404).json({ error: 'Teacher not found' });

            const formatted = {
                ...teacher,
                birth_date: toDateOnly(teacher.birth_date),
                hire_date: toDateOnly(teacher.hire_date),
            };
            res.json(formatted);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllTeachers(req, res) {
        try {
            const teacher = await teacherService.getAllTeachers();
            const formatted = teacher.map((t) => ({
                ...t,
                birth_date: toDateOnly(t.birth_date),
                hire_date: toDateOnly(t.hire_date),
            }));
            res.json(formatted);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateTeacher(req, res) {
        try {
            const { db } = require('../../config/db');
            const teacherId = req.params.id;

            const existingTeacher = await teacherService.getTeacher(teacherId);
            if (!existingTeacher)
                return res.status(404).json({ error: 'Teacher not found' });

            const {
                name,
                email,
                phone,
                birth_date,
                specialization,
                hire_date,
                qualification,
                subject_ids,
            } = req.body;
            console.log('Received update request for teacher:', teacherId);
            console.log('Request body:', req.body);
            console.log('Subject IDs:', req.body.subject_ids);
            await db.transaction(async (trx) => {
                const updates = {};
                if (specialization !== undefined)
                    updates.specialization = specialization;
                if (hire_date !== undefined) updates.hire_date = hire_date;
                if (qualification !== undefined)
                    updates.qualification = qualification;

                if (Object.keys(updates).length > 0) {
                    await teacherService.updateTeacher(teacherId, updates);
                }

                if (
                    name !== undefined ||
                    email !== undefined ||
                    phone !== undefined ||
                    birth_date !== undefined
                ) {
                    const userUpdates = {};
                    if (name !== undefined) userUpdates.name = name;
                    if (email !== undefined) userUpdates.email = email;
                    if (phone !== undefined) userUpdates.phone = phone;
                    if (birth_date !== undefined)
                        userUpdates.birth_date = birth_date;
                    await userService.updateUser(
                        existingTeacher.user_id,
                        userUpdates
                    );
                }

                if (Array.isArray(subject_ids)) {
                    await teacherService.clearAndAttachSubjects(
                        teacherId,
                        subject_ids,
                        trx
                    );
                }
            });

            const updated = await teacherService.getTeacher(teacherId);
            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteTeacher(req, res) {
        try {
            const result = await teacherService.deleteTeacher(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Teacher not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getSubjects(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const subjects = await teacherService.getSubjects(teacher.id);
            if (!subjects || subjects.length == 0)
                return res
                    .status(404)
                    .json({ error: 'Teacher subjects not found' });
            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getTeacherSchedule(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);

            if (!teacher)
                return res.status(404).json({ error: 'Teacher not found' });
            const schedule = await teacherService.getTeacherSchedule(
                teacher.id
            );
            if (!schedule)
                return res.status(404).json({ error: 'Schedule not found' });
            res.json(schedule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getQuestions(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const questions = await teacherService.getQuestions(teacher.id);
            if (!questions || questions.length == 0)
                return res
                    .status(404)
                    .json({ error: 'Teacher questions not found' });
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStudents(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            console.log(req.user.id);
            if (!teacher)
                return res.status(404).json({ error: 'Teacher not found' });
            const students = await teacherService.getStudents(teacher.id);
            if (!students || students.length == 0)
                return res
                    .status(404)
                    .json({ error: 'No students found for this teacher' });
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getClassesByTeacher(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const classess = await teacherService.getClassesByTeacher(
                teacher.id
            );
            if (!classess || classess.length == 0)
                return res
                    .status(404)
                    .json({ error: 'Teacher classess not found' });
            res.json(classess);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
