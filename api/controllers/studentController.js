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
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');

module.exports = {
    async createStudent(req, res) {
        const trx = await db.transaction();

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
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

            // Validate required fields
            if (
                !name ||
                !email ||
                !phone ||
                !birth_date ||
                !class_id ||
                !grade_level
            ) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Missing required fields for student creation.',
                            null,
                            'MISSING_REQUIRED_FIELDS'
                        )
                    );
            }

            const password = userService.generateRandomPassword();
            const hash = bcrypt.hashSync(password);

            // Get student role
            const role = await roleService.getRoleByName('student');
            if (!role || role.length === 0) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Student role not found in system.',
                            null,
                            'ROLE_NOT_FOUND'
                        )
                    );
            }

            // Get curriculum
            const curriculum = await studentService.getCurriculumId(
                grade_level
            );
            if (!curriculum) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            `No curriculum found for grade level: ${grade_level}`,
                            null,
                            'CURRICULUM_NOT_FOUND'
                        )
                    );
            }

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

            // Send welcome message (non-blocking)
            if (user[0]) {
                try {
                    const sendMessage = await userService.sendWhatsAppMessage(
                        user[0].phone,
                        `🎓 Welcome to Our School!

Dear Student,

Your account has been successfully created. Here are your login credentials:

📧 Email: ${email}
🔑 Password: ${password}

Please keep these credentials safe and do not share them with anyone.

You can now log in to your student portal and access your academic information.

Best regards,
School Administration Team`
                    );
                } catch (msgError) {
                    // Log but don't fail the transaction for WhatsApp errors
                    logError('WhatsApp message failed', msgError, {
                        userId: user[0].id,
                    });
                }
            }

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

            // Handle academic year and tuition setup
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
                        : parseFloat(discount_percentage) || 0;
                const isValidDiscount =
                    !isNaN(discount) && discount >= 0 && discount <= 100;
                const remainingTuition = isValidDiscount
                    ? Number((fullTuition * (1 - discount / 100)).toFixed(2))
                    : fullTuition;

                await db('archives')
                    .insert({
                        student_id: student[0].id,
                        academic_year_id: currentAcademicYear.id,
                        remaining_tuition: remainingTuition,
                    })
                    .transacting(trx);
            }

            await trx.commit();
            res.status(HTTP_STATUS.CREATED).json({
                student: student[0],
                user_id: user[0].id,
                message: 'Student created successfully',
            });
        } catch (error) {
            await handleTransactionError(trx, error, 'Create student');

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
                            'Invalid class_id or curriculum_id provided.',
                            null,
                            'INVALID_FOREIGN_KEY'
                        )
                    );
            }

            logError('Create student failed', error, {
                email,
                grade_level,
                class_id,
                createdBy: req.user?.id,
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create student due to server error.',
                    null,
                    'CREATE_STUDENT_ERROR'
                )
            );
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
            const { student_id } = req.body;
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
            const student = await studentService.findByUserId(req.user.id);
            console.log(student,req.user)
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            const academic_year =
                await academicYearService.findAllAccordingYearNow();
            if (!academic_year) {
                return res.status(404).json({
                    error: 'No active academic year found for current date',
                });
            }
            console.log('Academic year:', academic_year);

            const archive = await archiveService.findByAcademicYearId(
                academic_year.id,
                student.id
            );
            if (!archive) {
                return res.status(404).json({
                    error: 'Student archive not found for current academic year',
                });
            }
            console.log('Archive:', archive);

            const grades = await gradeService.findAllForStudent(archive.id);
            console.log('Grades:', grades);
            if (!grades || grades.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'No grades found for student' });
            }
            res.json(grades);
        } catch (error) {
            console.error('Error in getStudentScoreCard:', error);
            res.status(500).json({ error: error.message });
        }
    },
    async getStudentScoreCardFromArchive(req, res) {
        try {
            const { archive_id } = req.body;
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

    async searchStudents(req, res) {
        try {
            const {
                query,
                class_id,
                grade_level,
                is_active,
                page = 1,
                pageSize = 10,
            } = req.query;

            // Build search conditions
            let searchQuery = db('students')
                .join('users', 'students.user_id', 'users.id')
                .join('classes', 'students.class_id', 'classes.id')
                .join('curriculums', 'students.curriculum_id', 'curriculums.id')
                .select(
                    'students.id',
                    'students.grade_level',
                    'students.created_at as student_created_at',
                    'users.name',
                    'users.email',
                    'users.phone',
                    'users.birth_date',
                    'users.is_active',
                    'classes.name as class_name',
                    'curriculums.name as curriculum_name'
                );

            // Apply search filters
            if (query) {
                searchQuery = searchQuery.where(function () {
                    this.where('users.name', 'like', `%${query}%`)
                        .orWhere('users.email', 'like', `%${query}%`)
                        .orWhere('users.phone', 'like', `%${query}%`);
                });
            }

            if (class_id) {
                searchQuery = searchQuery.where('students.class_id', class_id);
            }

            if (grade_level) {
                searchQuery = searchQuery.where(
                    'students.grade_level',
                    grade_level
                );
            }

            if (is_active !== undefined) {
                searchQuery = searchQuery.where(
                    'users.is_active',
                    is_active === 'true'
                );
            }

            // Get total count for pagination
            const countQuery = searchQuery.clone();
            const totalResult = await countQuery.count('* as total');
            const total = parseInt(totalResult[0].total, 10);

            // Apply pagination
            const offset = (page - 1) * pageSize;
            const students = await searchQuery
                .orderBy('users.name', 'asc')
                .limit(pageSize)
                .offset(offset);

            // Format birth dates
            const formattedStudents = students.map((student) => ({
                ...student,
                birth_date: toDateOnly(student.birth_date),
            }));

            res.json({
                students: formattedStudents,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                error: 'Error searching students',
                details: error.message,
            });
        }
    },

    async searchStudentsAdvanced(req, res) {
        try {
            const {
                name,
                email,
                phone,
                class_name,
                curriculum_name,
                grade_level,
                is_active,
                birth_date_from,
                birth_date_to,
                created_date_from,
                created_date_to,
                page = 1,
                pageSize = 10,
                sortBy = 'name',
                sortOrder = 'asc',
            } = req.query;

            let searchQuery = db('students')
                .join('users', 'students.user_id', 'users.id')
                .join('classes', 'students.class_id', 'classes.id')
                .join('curriculums', 'students.curriculum_id', 'curriculums.id')
                .select(
                    'students.id',
                    'students.grade_level',
                    'students.created_at as student_created_at',
                    'users.name',
                    'users.email',
                    'users.phone',
                    'users.birth_date',
                    'users.is_active',
                    'users.created_at as user_created_at',
                    'classes.name as class_name',
                    'curriculums.name as curriculum_name'
                );

            // Apply advanced filters
            if (name) {
                searchQuery = searchQuery.where(
                    'users.name',
                    'like',
                    `%${name}%`
                );
            }

            if (email) {
                searchQuery = searchQuery.where(
                    'users.email',
                    'like',
                    `%${email}%`
                );
            }

            if (phone) {
                searchQuery = searchQuery.where(
                    'users.phone',
                    'like',
                    `%${phone}%`
                );
            }

            if (class_name) {
                searchQuery = searchQuery.where(
                    'classes.name',
                    'like',
                    `%${class_name}%`
                );
            }

            if (curriculum_name) {
                searchQuery = searchQuery.where(
                    'curriculums.name',
                    'like',
                    `%${curriculum_name}%`
                );
            }

            if (grade_level) {
                searchQuery = searchQuery.where(
                    'students.grade_level',
                    grade_level
                );
            }

            if (is_active !== undefined) {
                searchQuery = searchQuery.where(
                    'users.is_active',
                    is_active === 'true'
                );
            }

            if (birth_date_from) {
                searchQuery = searchQuery.where(
                    'users.birth_date',
                    '>=',
                    birth_date_from
                );
            }

            if (birth_date_to) {
                searchQuery = searchQuery.where(
                    'users.birth_date',
                    '<=',
                    birth_date_to
                );
            }

            if (created_date_from) {
                searchQuery = searchQuery.where(
                    'users.created_at',
                    '>=',
                    created_date_from
                );
            }

            if (created_date_to) {
                searchQuery = searchQuery.where(
                    'users.created_at',
                    '<=',
                    created_date_to
                );
            }

            // Get total count
            const countQuery = searchQuery.clone();
            const totalResult = await countQuery.count('* as total');
            const total = parseInt(totalResult[0].total, 10);

            // Apply sorting and pagination
            const offset = (page - 1) * pageSize;
            const students = await searchQuery
                .orderBy(sortBy, sortOrder)
                .limit(pageSize)
                .offset(offset);

            // Format dates
            const formattedStudents = students.map((student) => ({
                ...student,
                birth_date: toDateOnly(student.birth_date),
                user_created_at: toDateOnly(student.user_created_at),
                student_created_at: toDateOnly(student.student_created_at),
            }));

            res.json({
                students: formattedStudents,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
                filters: {
                    name,
                    email,
                    phone,
                    class_name,
                    curriculum_name,
                    grade_level,
                    is_active,
                    birth_date_from,
                    birth_date_to,
                    created_date_from,
                    created_date_to,
                },
            });
        } catch (error) {
            console.error('Advanced search error:', error);
            res.status(500).json({
                error: 'Error performing advanced search',
                details: error.message,
            });
        }
    },
};
