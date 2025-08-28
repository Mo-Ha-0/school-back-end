const studentService = require('../services/studentService');
const userService = require('../services/userService');
const roleService = require('../services/roleService');
const gradeService = require('../services/gradeService');
const archiveService = require('../services/archiveService');
const academicYearService = require('../services/academicYearService');
const ExcelService = require('../services/excelService');
const { validationResult } = require('express-validator');
const { db } = require('../../config/db');
const { toDateOnly } = require('../utils/dateUtils');
const { stripSensitive } = require('../utils/sanitize');

const bcrypt = require('bcrypt-nodejs');

module.exports = {
    async createStudent(req, res) {
        const { db } = require('../../config/db');

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                email,
                phone,
                birth_date,
                class_id,
                grade_level,
                discount_percentage,
            } = req.body;
            const password = userService.generateRandomPassword();

            const hash = bcrypt.hashSync(password);
            const role = await roleService.getRoleByName('student');
            console.log(role);
            if (!role || role.length == 0) {
                return res
                    .status(400)
                    .json({ msg: 'there is no role for student' });
            }
            const curriculum = await studentService.getCurriculumId(
                grade_level
            );
            console.log(curriculum);
            // Using transaction
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
                // if (user[0]) {
                //     const sendMessage = await userService.sendWhatsAppMessage(
                //         user[0].phone,
                //         `your email is : ${email}
                //         and password is:
                //         ${password}`
                //     );
                //     console.log(sendMessage);
                // }
                // Create student within the same transaction
                const student = await studentService.createStudent(
                    {
                        user_id: user[0].id,
                        class_id: class_id,
                        curriculum_id: curriculum.id,
                        grade_level: grade_level,
                    },
                    trx
                );
                const today = new Date().toISOString().split('T')[0];
                let currentAcademicYear = await db('academic_years')
                    .where('start_year', '<=', today)
                    .andWhere('end_year', '>=', today)
                    .orderBy('start_year', 'desc')
                    .first()
                    .transacting(trx);
                if (!currentAcademicYear) {
                    currentAcademicYear = await db('academic_years')
                        .orderBy('start_year', 'desc')
                        .first()
                        .transacting(trx);
                }

                if (currentAcademicYear) {
                    const fullTuition =
                        Number(currentAcademicYear.full_tuition) || 0;
                    const discount =
                        typeof discount_percentage === 'number'
                            ? discount_percentage
                            : parseFloat(discount_percentage);
                    const isValidDiscount =
                        !isNaN(discount) && discount >= 0 && discount <= 100;
                    const remainingTuition = isValidDiscount
                        ? Number(
                              (fullTuition * (1 - discount / 100)).toFixed(2)
                          )
                        : fullTuition;

                    await db('archives')
                        .insert({
                            student_id: student[0].id,
                            academic_year_id: currentAcademicYear.id,
                            remaining_tuition: remainingTuition,
                        })
                        .transacting(trx);
                }

                return student;
            });

            res.status(201).json(result);
        } catch (error) {
            console.error('Transaction error:', error);
            res.status(400).json({
                error: error.message,
                msg: 'Failed to create student. All changes rolled back.',
            });
        }
    },

    async getStudent(req, res) {
        try {
            const student = await studentService.getStudent(req.params.id);
            if (!student)
                return res.status(404).json({ error: 'Student not found' });
            res.json(student);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllStudents(req, res) {
        try {
            const student = await studentService.getAllStudents();
            const formattedStudents = student.map((student) => {
                return {
                    ...student,
                    birth_date: toDateOnly(student.birth_date),
                };
            });
            res.json(formattedStudents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateStudent(req, res) {
        try {
            const student = await studentService.updateStudent(
                req.params.id,
                req.body
            );
            if (!student || student.length == 0)
                return res.status(404).json({ error: 'Student not found' });
            res.json(student);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteStudent(req, res) {
        try {
            const result = await studentService.deleteStudent(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Student not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStudentSubjects(req, res) {
        try {
            const userId = req.user.id;
            const student = await db('students')
                .select('*')
                .where({ user_id: userId });
            const subjects = await studentService.getSubjects(student[0].id);
            if (!subjects)
                return res.status(404).json({ error: 'Student not found' });
            res.json(subjects);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getClass(req, res) {
        try {
            const student = await studentService.getStudent(req.body.id);
            if (!student)
                return res.status(404).json({ error: 'Student Not found' });
            const Class = await studentService.getClass(req.body.id);
            if (!Class)
                return res.status(404).json({ error: 'Class not found' });
            res.json(Class);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getStudentArchive(req, res) {
        try {
            const {student_id}=req.body;
            const studentExists = await studentService.getStudent(student_id);
            if (!studentExists)
                return res.status(404).json({ error: 'student not found' });
            const archive = await studentService.getStudentArchive(student_id);
            if (!archive)
                return res.status(404).json({ error: 'archive not found' });
            res.json(stripSensitive(archive));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStudentSubjectsNameList(req, res) {
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
                .select('id', 'name as subject_name')
                .where({ curriculum_id: studentCurriculum.curriculum_id });

            if (!subjects)
                return res.status(404).json({ error: 'Student not found' });

            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStudentSchedule(req, res) {
        try {
            const userId = req.user.id;
            const student = await db('students')
                .select('*')
                .where({ user_id: userId });
            console.log(student, userId);
            if (!student)
                return res.status(404).json({ error: 'Student Not found' });
            const schedules = await studentService.getStudentSchedule(
                student[0].id
            );
            if (!schedules)
                return res.status(404).json({ error: 'Class not found' });
            res.json(schedules);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getStudentsByClass(req, res) {
        try {
            const { classId } = req.params;
            const students = await studentService.getStudentsByClass(classId);
            if (!students || students.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'No students found in this class' });
            }
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async createStudentsFromExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const filePath = req.file.path;

            // Read and parse Excel file
            const students = await ExcelService.readExcelFile(filePath);

            // Validate student data
            const validation = ExcelService.validateStudentData(students);

            if (validation.errors.length > 0) {
                // Clean up the uploaded file
                await ExcelService.cleanupFile(filePath);

                return res.status(400).json({
                    error: 'Validation errors found in Excel file',
                    errors: validation.errors,
                    message: 'Please fix the errors and upload again',
                });
            }

            if (validation.validStudents.length === 0) {
                await ExcelService.cleanupFile(filePath);
                return res.status(400).json({
                    error: 'No valid student data found in Excel file',
                });
            }

            // Get student role
            const role = await roleService.getRoleByName('student');
            if (!role || role.length === 0) {
                await ExcelService.cleanupFile(filePath);
                return res
                    .status(400)
                    .json({ error: 'Student role not found' });
            }

            const results = {
                created: [],
                errors: [],
                totalProcessed: validation.validStudents.length,
            };

            // Process each valid student
            for (const studentData of validation.validStudents) {
                try {
                    // Check if user already exists
                    const existingUser = await userService.getUserByEmail(
                        studentData.email
                    );
                    if (existingUser) {
                        results.errors.push({
                            email: studentData.email,
                            error: 'User with this email already exists',
                        });
                        continue;
                    }

                    // Get curriculum ID
                    const curriculum = await studentService.getCurriculumId(
                        studentData.grade_level
                    );
                    if (!curriculum) {
                        results.errors.push({
                            email: studentData.email,
                            error: `No curriculum found for grade level: ${studentData.grade_level}`,
                        });
                        continue;
                    }

                    // Generate password and hash
                    const password = userService.generateRandomPassword();
                    const hash = bcrypt.hashSync(password);

                    // Create user and student within transaction
                    const result = await db.transaction(async (trx) => {
                        // Create user
                        const user = await userService.createUser(
                            {
                                name: studentData.name,
                                birth_date: studentData.birth_date,
                                email: studentData.email,
                                phone: studentData.phone,
                                role_id: role[0].id,
                                password_hash: hash,
                            },
                            trx
                        );

                        // Create student
                        const student = await studentService.createStudent(
                            {
                                user_id: user[0].id,
                                class_id: studentData.class_id,
                                curriculum_id: curriculum.id,
                                grade_level: studentData.grade_level,
                            },
                            trx
                        );

                        // Handle tuition payment setup
                        const today = new Date().toISOString().split('T')[0];
                        let currentAcademicYear = await db('academic_years')
                            .where('start_year', '<=', today)
                            .andWhere('end_year', '>=', today)
                            .orderBy('start_year', 'desc')
                            .first()
                            .transacting(trx);

                        if (!currentAcademicYear) {
                            currentAcademicYear = await db('academic_years')
                                .orderBy('start_year', 'desc')
                                .first()
                                .transacting(trx);
                        }

                        if (currentAcademicYear) {
                            const fullTuition =
                                Number(currentAcademicYear.full_tuition) || 0;
                            const discount =
                                studentData.discount_percentage || 0;
                            const remainingTuition = Number(
                                (fullTuition * (1 - discount / 100)).toFixed(2)
                            );

                            await db('archives')
                                .insert({
                                    student_id: student[0].id,
                                    academic_year_id: currentAcademicYear.id,
                                    remaining_tuition: remainingTuition,
                                })
                                .transacting(trx);
                        }

                        return { user: user[0], student: student[0] };
                    });

                    results.created.push({
                        email: studentData.email,
                        name: studentData.name,
                        password: password,
                    });
                } catch (error) {
                    results.errors.push({
                        email: studentData.email,
                        error: error.message,
                    });
                }
            }

            // Clean up the uploaded file
            await ExcelService.cleanupFile(filePath);

            // Return results
            res.status(200).json({
                message: 'Bulk student creation completed',
                results: results,
                summary: {
                    totalProcessed: results.totalProcessed,
                    successfullyCreated: results.created.length,
                    errors: results.errors.length,
                },
            });
        } catch (error) {
            // Clean up file in case of error
            if (req.file) {
                await ExcelService.cleanupFile(req.file.path);
            }

            res.status(500).json({
                error: 'Error processing Excel file',
                details: error.message,
            });
        }
    },

    async getStudentScoreCard(req, res) {
        try {
            const student=await studentService.findByUserId(req.user.id);
            const academic_year = await academicYearService.findAllAccordingYearNow();
            console.log(student,academic_year);
            const archive = await archiveService.findByAcademicYearId(academic_year.id,student.id);
            console.log(archive);
            const grades = await gradeService.findAllForStudent(archive.id);
            console.log(grades);
            if (!grades)
                return res.status(404).json({ error: 'grades not found' });
            res.json(grades);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStudentScoreCardFromArchive(req, res) {
        try {
            const {archive_id}=req.body;
            // const student=await studentService.findByUserId(req.user.id);          
            const grades = await gradeService.findAllForStudent(archive_id);
            console.log(grades);
            if (!grades)
                return res.status(404).json({ error: 'grades not found' });
            res.json(grades);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
