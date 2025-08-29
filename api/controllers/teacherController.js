const teacherService = require('../services/teacherService');
const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const roleService = require('../services/roleService');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
const { getSubject } = require('./subjectController');
const { toDateOnly } = require('../utils/dateUtils');
module.exports = {
    async createTeacher(req, res) {
        try {
            const { db } = require('../../config/db');
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
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
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Teacher role not found in system.',
                            null,
                            'ROLE_NOT_FOUND'
                        )
                    );
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

            res.status(HTTP_STATUS.CREATED).json(result);
        } catch (error) {
            logError('Create teacher failed', error, {
                email: req.body.email,
                specialization: req.body.specialization,
                createdBy: req.user?.id,
            });

            // Handle specific database errors
            if (error.code === '23505') {
                return res
                    .status(HTTP_STATUS.CONFLICT)
                    .json(
                        createErrorResponse(
                            'A user with this email already exists.',
                            null,
                            'EMAIL_EXISTS'
                        )
                    );
            }

            if (error.code === '23503') {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Invalid role_id or subject_ids provided.',
                            null,
                            'INVALID_FOREIGN_KEY'
                        )
                    );
            }

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create teacher due to server error.',
                    null,
                    'CREATE_TEACHER_ERROR'
                )
            );
        }
    },

    async getTeacher(req, res) {
        try {
            const teacher = await teacherService.getTeacher(req.params.id);
            if (!teacher) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher not found.',
                            null,
                            'TEACHER_NOT_FOUND'
                        )
                    );
            }

            const formatted = {
                ...teacher,
                birth_date: toDateOnly(teacher.birth_date),
                hire_date: toDateOnly(teacher.hire_date),
            };
            res.json(formatted);
        } catch (error) {
            logError('Get teacher failed', error, { teacherId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher.',
                    null,
                    'GET_TEACHER_ERROR'
                )
            );
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
            logError('Get all teachers failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teachers.',
                    null,
                    'GET_TEACHERS_ERROR'
                )
            );
        }
    },

    async updateTeacher(req, res) {
        try {
            const { db } = require('../../config/db');
            const teacherId = req.params.id;

            const existingTeacher = await teacherService.getTeacher(teacherId);
            if (!existingTeacher) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher not found.',
                            null,
                            'TEACHER_NOT_FOUND'
                        )
                    );
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
            logError('Update teacher failed', error, {
                teacherId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update teacher.',
                    null,
                    'UPDATE_TEACHER_ERROR'
                )
            );
        }
    },

    async deleteTeacher(req, res) {
        try {
            const result = await teacherService.deleteTeacher(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher not found.',
                            null,
                            'TEACHER_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Teacher deleted successfully',
            });
        } catch (error) {
            logError('Delete teacher failed', error, {
                teacherId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete teacher.',
                    null,
                    'DELETE_TEACHER_ERROR'
                )
            );
        }
    },
    async getSubjects(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const subjects = await teacherService.getSubjects(teacher.id);
            if (!subjects || subjects.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher subjects not found.',
                            null,
                            'TEACHER_SUBJECTS_NOT_FOUND'
                        )
                    );
            }
            res.json(subjects);
        } catch (error) {
            logError('Get teacher subjects failed', error, {
                teacherId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher subjects.',
                    null,
                    'GET_TEACHER_SUBJECTS_ERROR'
                )
            );
        }
    },

    async getTeacherSchedule(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);

            if (!teacher) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher not found.',
                            null,
                            'TEACHER_NOT_FOUND'
                        )
                    );
            }
            const schedule = await teacherService.getTeacherSchedule(
                teacher.id
            );
            if (!schedule) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Schedule not found.',
                            null,
                            'SCHEDULE_NOT_FOUND'
                        )
                    );
            }
            res.json(schedule);
        } catch (error) {
            logError('Get teacher schedule failed', error, {
                teacherId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher schedule.',
                    null,
                    'GET_TEACHER_SCHEDULE_ERROR'
                )
            );
        }
    },

    async getQuestions(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const questions = await teacherService.getQuestions(teacher.id);
            if (!questions || questions.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher questions not found.',
                            null,
                            'TEACHER_QUESTIONS_NOT_FOUND'
                        )
                    );
            }
            res.json(questions);
        } catch (error) {
            logError('Get teacher questions failed', error, {
                teacherId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher questions.',
                    null,
                    'GET_TEACHER_QUESTIONS_ERROR'
                )
            );
        }
    },

    async getStudents(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            console.log(req.user.id);
            if (!teacher) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher not found.',
                            null,
                            'TEACHER_NOT_FOUND'
                        )
                    );
            }
            const students = await teacherService.getStudents(teacher.id);
            if (!students || students.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'No students found for this teacher.',
                            null,
                            'NO_STUDENTS_FOUND'
                        )
                    );
            }
            res.json(students);
        } catch (error) {
            logError('Get teacher students failed', error, {
                teacherId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher students.',
                    null,
                    'GET_TEACHER_STUDENTS_ERROR'
                )
            );
        }
    },

    async getClassesByTeacher(req, res) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            const classess = await teacherService.getClassesByTeacher(
                teacher.id
            );
            if (!classess || classess.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Teacher classes not found.',
                            null,
                            'TEACHER_CLASSES_NOT_FOUND'
                        )
                    );
            }
            res.json(classess);
        } catch (error) {
            logError('Get teacher classes failed', error, {
                teacherId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve teacher classes.',
                    null,
                    'GET_TEACHER_CLASSES_ERROR'
                )
            );
        }
    },
};
