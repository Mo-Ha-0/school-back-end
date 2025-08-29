const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt-nodejs');

/**
 * Comprehensive School Management System Seeder
 *
 * This single seed file creates a complete school management system with:
 * - Roles and permissions
 * - System and demo users (with proper role_id)
 * - Academic infrastructure
 * - Students, teachers, classes
 * - Comprehensive demo data (archives, exams, grades, attendance, etc.)
 */
exports.seed = async function (knex) {
    console.log('🚀 Starting Comprehensive School Management System Seeding');
    console.log('='.repeat(70));

    try {
        // ================================================================
        // PHASE 1: CLEAR ALL DATA IN PROPER DEPENDENCY ORDER
        // ================================================================
        console.log('\n🧹 Phase 1: Clearing existing data...');

        // Clear in dependency order (child tables first)
        await knex('tuition_payments').del();
        await knex('behaviors').del();
        await knex('attendance_students').del();
        await knex('attendance_teachers').del();
        await knex('attendance_employees').del();
        await knex('notifications').del();
        await knex('fcm_tokens').del();
        await knex('answers').del();
        await knex('exam_attempts').del();
        await knex('grades').del();
        await knex('exam_question').del();
        await knex('options').del();
        await knex('questions').del();
        await knex('exams').del();
        await knex('archives').del();
        await knex('schedules').del();
        await knex('teachers_subjects').del();
        await knex('periods').del();
        await knex('days').del();
        await knex('subjects').del();
        await knex('students').del();
        await knex('teachers').del();
        await knex('classes').del();
        await knex('users').del();
        await knex('role_permissions').del();
        await knex('permissions').del();
        await knex('roles').del();
        await knex('semesters').del();
        await knex('curriculums').del();
        await knex('academic_years').del();

        console.log('✅ All tables cleared successfully');

        // ================================================================
        // PHASE 2: CREATE ROLES AND PERMISSIONS
        // ================================================================
        console.log('\n🔑 Phase 2: Creating roles and permissions...');

        // Create roles
        const roles = await knex('roles')
            .insert([
                { name: 'admin' },
                { name: 'student' },
                { name: 'teacher' },
                { name: 'manager' },
                { name: 'accountant' },
            ])
            .returning('*');

        const [
            adminRole,
            studentRole,
            teacherRole,
            managerRole,
            accountantRole,
        ] = roles;

        // Create consolidated permissions for all API endpoints
        const permissionsList = [
            // Academic Management
            { name: 'manage_academic_years' }, // create, read, update, delete academic years
            { name: 'manage_semesters' }, // create, read, update, delete semesters
            { name: 'manage_curriculums' }, // create, read, update, delete curriculums
            { name: 'manage_subjects' }, // create, read, update, delete subjects
            { name: 'manage_classes' }, // create, read, update, delete classes

            // Student Management
            { name: 'manage_students' }, // create, read, update, delete students
            { name: 'view_student_profiles' }, // get student profiles, grades, exams
            { name: 'manage_student_archives' }, // create, read, update, delete archives

            // Teacher Management
            { name: 'manage_teachers' }, // create, read, update, delete teachers
            { name: 'assign_teacher_subjects' }, // assign teachers to subjects
            { name: 'view_teacher_schedules' }, // view teacher schedules and classes

            // Exam Management
            { name: 'manage_exams' }, // create, read, update, delete exams
            { name: 'manage_questions' }, // create, read, update, delete questions and options
            { name: 'manage_exam_attempts' }, // create, read, update, delete exam attempts
            { name: 'view_exam_results' }, // view exam results and analytics

            // Grade Management
            { name: 'manage_grades' }, // create, read, update, delete grades

            // Attendance Management
            { name: 'manage_student_attendance' }, // create, read, update, delete student attendance
            { name: 'manage_teacher_attendance' }, // create, read, update, delete teacher attendance
            { name: 'manage_employee_attendance' }, // create, read, update, delete employee attendance
            { name: 'view_attendance_reports' }, // view attendance reports and analytics

            // Behavior Management
            { name: 'manage_behaviors' }, // create, read, update, delete behaviors
            { name: 'view_behavior_reports' }, // view behavior reports and analytics

            // Schedule Management
            { name: 'manage_schedules' }, // create, read, update, delete schedules
            { name: 'manage_days_periods' }, // create, read, update, delete days and periods

            // Financial Management
            { name: 'manage_tuition_payments' }, // create, read, update, delete tuition payments

            // User Management
            { name: 'manage_users' }, // create, read, update, delete users
            { name: 'manage_roles' }, // create, read, update, delete roles
            { name: 'manage_permissions' }, // create, read, update, delete permissions

            // System Management
            { name: 'view_dashboard' }, // view system dashboard and analytics
            { name: 'manage_notifications' }, // create, read, update, delete notifications
            { name: 'manage_fcm_tokens' }, // manage push notification tokens
        ];

        const permissions = await knex('permissions')
            .insert(permissionsList)
            .returning('*');

        // Assign all permissions to all roles (for demo purposes)
        const rolePermissions = [];
        for (const role of roles) {
            for (const permission of permissions) {
                rolePermissions.push({
                    role_id: role.id,
                    permission_id: permission.id,
                });
            }
        }

        await knex('role_permissions').insert(rolePermissions);
        console.log(
            `✅ Created ${roles.length} roles and ${permissions.length} comprehensive permissions`
        );

        // ================================================================
        // PHASE 3: CREATE SYSTEM USERS WITH PROPER ROLES
        // ================================================================
        console.log('\n👤 Phase 3: Creating system and demo users...');

        const systemUsers = [
            // Admin users
            {
                name: 'System Administrator',
                email: 'admin@system.com',
                password_hash: bcrypt.hashSync('Admin123'),
                role_id: adminRole.id,
                phone: '+1-555-0123',
                birth_date: '1985-06-15',
            },

            // Demo accounts
            {
                name: 'Demo Student',
                email: 'student@system.com',
                password_hash: bcrypt.hashSync('Student123'),
                role_id: studentRole.id,
                phone: '+1-555-0124',
                birth_date: '2006-03-22',
            },
            {
                name: 'Demo Teacher',
                email: 'teacher@system.com',
                password_hash: bcrypt.hashSync('Teacher123'),
                role_id: teacherRole.id,
                phone: '+1-555-0126',
                birth_date: '1988-11-08',
            },
            {
                name: 'School Principal',
                email: 'principal@system.com',
                password_hash: bcrypt.hashSync('Principal123'),
                role_id: teacherRole.id,
                phone: '+1-555-0127',
                birth_date: '1975-04-12',
            },
        ];

        // Create manager users
        for (let i = 1; i <= 5; i++) {
            systemUsers.push({
                name: `Manager User ${i}`,
                email: `manager${i}@system.com`,
                password_hash: bcrypt.hashSync('Manager123'),
                role_id: managerRole.id,
                phone: `555000${i.toString().padStart(4, '0')}`,
                birth_date: '1990-01-01',
            });
        }

        // Create accountant users
        for (let i = 1; i <= 5; i++) {
            systemUsers.push({
                name: `Accountant User ${i}`,
                email: `accountant${i}@system.com`,
                password_hash: bcrypt.hashSync('Accountant123'),
                role_id: accountantRole.id,
                phone: `555100${i.toString().padStart(4, '0')}`,
                birth_date: '1990-01-01',
            });
        }

        const systemUserIds = await knex('users')
            .insert(systemUsers)
            .returning('id');
        console.log(
            `✅ Created ${systemUsers.length} system users with proper roles`
        );

        // ================================================================
        // PHASE 4: CREATE ACADEMIC INFRASTRUCTURE
        // ================================================================
        console.log('\n🏫 Phase 4: Creating academic infrastructure...');

        // Create Academic Years
        const currentYear = new Date().getFullYear();
        const currentDate = new Date();
        const academicYears = [];

        // Ensure we have an academic year that covers the current date
        academicYears.push({
            start_year: `${currentYear}-01-01`,
            end_year: `${currentYear + 1}-12-31`,
            full_tuition: faker.number.int({ min: 8000, max: 15000 }),
        });

        // Add additional academic years for testing
        for (let i = 1; i < 3; i++) {
            const startYear = currentYear - i;
            const endYear = startYear + 1;
            academicYears.push({
                start_year: `${startYear}-01-01`,
                end_year: `${endYear}-12-31`,
                full_tuition: faker.number.int({ min: 8000, max: 15000 }),
            });
        }
        const academicYearIds = await knex('academic_years')
            .insert(academicYears)
            .returning('id');

        // Create Semesters
        const semesters = [];
        for (let i = 0; i < academicYearIds.length; i++) {
            const academicYear = academicYearIds[i];
            const yearId = academicYear.id || academicYear;
            const startYear = currentYear - i;

            // First Semester (Jan-Jun)
            semesters.push({
                academic_year_id: yearId,
                semester_name: 'first_semester',
                start_date: `${startYear}-01-01`,
                end_date: `${startYear}-06-30`,
            });

            // Second Semester (Jul-Dec)
            semesters.push({
                academic_year_id: yearId,
                semester_name: 'second_semester',
                start_date: `${startYear}-07-01`,
                end_date: `${startYear}-12-31`,
            });
        }
        const semesterIds = await knex('semesters')
            .insert(semesters)
            .returning('id');

        // Create Curriculums
        const curriculums = [
            {
                level_grade: '9',
                is_active: true,
                created_by: systemUserIds[0].id || systemUserIds[0],
            },
            {
                level_grade: '10',
                is_active: true,
                created_by: systemUserIds[0].id || systemUserIds[0],
            },
            {
                level_grade: '11',
                is_active: true,
                created_by: systemUserIds[0].id || systemUserIds[0],
            },
            {
                level_grade: '12',
                is_active: true,
                created_by: systemUserIds[0].id || systemUserIds[0],
            },
        ];
        const curriculumIds = await knex('curriculums')
            .insert(curriculums)
            .returning('id');

        // Create Classes (Expanded for better testing)
        const classes = [];
        for (let grade = 9; grade <= 12; grade++) {
            for (let section = 1; section <= 5; section++) {
                // 5 sections per grade instead of 2
                classes.push({
                    class_name: `Grade ${grade} - Section ${String.fromCharCode(
                        64 + section
                    )}`, // A, B, C, D, E
                    level_grade: grade.toString(),
                    floor_number: Math.floor((grade - 9) / 2) + 1, // Floor 1-2
                });
            }
        }
        const classIds = await knex('classes').insert(classes).returning('id');

        // Create Subjects (Comprehensive curriculum)
        const subjectData = [
            {
                name: 'Mathematics',
                curriculum_id: curriculumIds[0].id || curriculumIds[0],
                resources: 'Textbooks, calculators, graphing software',
            },
            {
                name: 'English Literature',
                curriculum_id: curriculumIds[1].id || curriculumIds[1],
                resources: 'Classic literature, writing guides',
            },
            {
                name: 'Physics',
                curriculum_id: curriculumIds[2].id || curriculumIds[2],
                resources: 'Laboratory equipment, simulation software',
            },
            {
                name: 'Chemistry',
                curriculum_id: curriculumIds[3].id || curriculumIds[3],
                resources: 'Chemistry lab, periodic table charts',
            },
            {
                name: 'Biology',
                curriculum_id: curriculumIds[0].id || curriculumIds[0],
                resources: 'Microscopes, biological specimens',
            },
            {
                name: 'History',
                curriculum_id: curriculumIds[1].id || curriculumIds[1],
                resources: 'Historical texts, multimedia presentations',
            },
            {
                name: 'Geography',
                curriculum_id: curriculumIds[2].id || curriculumIds[2],
                resources: 'Maps, atlas, GIS software',
            },
            {
                name: 'Computer Science',
                curriculum_id: curriculumIds[3].id || curriculumIds[3],
                resources: 'Computers, programming environments',
            },
            {
                name: 'Arabic Language',
                curriculum_id: curriculumIds[0].id || curriculumIds[0],
                resources: 'Arabic texts, grammar guides',
            },
            {
                name: 'Islamic Studies',
                curriculum_id: curriculumIds[1].id || curriculumIds[1],
                resources: 'Religious texts, study guides',
            },
            {
                name: 'Physical Education',
                curriculum_id: curriculumIds[2].id || curriculumIds[2],
                resources: 'Sports equipment, fitness facilities',
            },
            {
                name: 'Art & Design',
                curriculum_id: curriculumIds[3].id || curriculumIds[3],
                resources: 'Art supplies, design software',
            },
            {
                name: 'Music',
                curriculum_id: curriculumIds[0].id || curriculumIds[0],
                resources: 'Musical instruments, recording equipment',
            },
            {
                name: 'French Language',
                curriculum_id: curriculumIds[1].id || curriculumIds[1],
                resources: 'Language learning materials, audio resources',
            },
            {
                name: 'Economics',
                curriculum_id: curriculumIds[2].id || curriculumIds[2],
                resources: 'Economic textbooks, market data',
            },
        ];
        const subjectIds = await knex('subjects')
            .insert(subjectData)
            .returning('id');

        console.log(`✅ Created EXPANDED academic infrastructure:
        - ${academicYears.length} academic years
        - ${semesters.length} semesters  
        - ${curriculums.length} curriculums
        - ${classes.length} classes (5 sections per grade)
        - ${subjectData.length} comprehensive subjects`);

        // ================================================================
        // PHASE 5: CREATE STUDENTS AND TEACHERS WITH PROPER ROLES
        // ================================================================
        console.log('\n👨‍🎓 Phase 5: Creating students and teachers...');

        // Create Student Users (with proper role_id from start) - EXPANDED
        const studentUsers = [];
        const totalStudents = 400; // 20 students per class on average (20 classes × 20 = 400)

        for (let i = 0; i < totalStudents; i++) {
            const gender = faker.helpers.arrayElement(['male', 'female']);
            const firstName =
                gender === 'male'
                    ? faker.person.firstName('male')
                    : faker.person.firstName('female');
            const lastName = faker.person.lastName();

            studentUsers.push({
                name: `${firstName} ${lastName}`,
                email: faker.internet.email({
                    firstName,
                    lastName,
                    provider: 'school.edu',
                }),
                password_hash: bcrypt.hashSync('password123'),
                role_id: studentRole.id, // ✅ Proper role assignment from start
                phone: faker.phone.number('###-###-####'),
                birth_date: faker.date
                    .birthdate({
                        min: 2005,
                        max: 2010,
                        mode: 'year',
                    })
                    .toISOString()
                    .split('T')[0],
            });
        }

        // Create Teacher Users (with proper role_id from start) - EXPANDED
        const teacherUsers = [];
        const teacherTitles = ['Dr.', 'Prof.', 'Ms.', 'Mr.', 'Mrs.'];
        const totalTeachers = 75; // More teachers for comprehensive testing

        for (let i = 0; i < totalTeachers; i++) {
            const title = faker.helpers.arrayElement(teacherTitles);
            const fullName = faker.person.fullName();

            teacherUsers.push({
                name: `${title} ${fullName}`,
                email: faker.internet.email({ provider: 'school.edu' }),
                password_hash: bcrypt.hashSync('password123'),
                role_id: teacherRole.id, // ✅ Proper role assignment from start
                phone: faker.phone.number('###-###-####'),
                birth_date: faker.date
                    .birthdate({
                        min: 1975,
                        max: 1995,
                        mode: 'year',
                    })
                    .toISOString()
                    .split('T')[0],
            });
        }

        // Insert all users and get their IDs
        const allSchoolUsers = [...studentUsers, ...teacherUsers];
        const schoolUserIds = await knex('users')
            .insert(allSchoolUsers)
            .returning('id');

        const studentUserIds = schoolUserIds.slice(0, totalStudents);
        const teacherUserIds = schoolUserIds.slice(totalStudents);

        // Create Student Records (Better distribution)
        const students = [];
        for (let i = 0; i < totalStudents; i++) {
            const classId = classIds[i % classIds.length]; // Distribute evenly across classes
            const gradeLevel = Math.floor(i / 100) + 9; // 100 students per grade (9-12)

            students.push({
                user_id: studentUserIds[i].id || studentUserIds[i],
                class_id: classId.id || classId,
                curriculum_id:
                    curriculumIds[gradeLevel - 9].id ||
                    curriculumIds[gradeLevel - 9],
                grade_level: gradeLevel,
            });
        }
        const studentRecordIds = await knex('students')
            .insert(students)
            .returning('id');

        // Create Teacher Records (Match expanded subjects)
        const teachers = [];
        const specializations = [
            'Mathematics',
            'English Literature',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
            'Computer Science',
            'Arabic Language',
            'Islamic Studies',
            'Physical Education',
            'Art & Design',
            'Music',
            'French Language',
            'Economics',
        ];

        for (let i = 0; i < teacherUserIds.length; i++) {
            teachers.push({
                user_id: teacherUserIds[i].id || teacherUserIds[i],
                specialization: specializations[i % specializations.length],
                qualification: faker.helpers.arrayElement([
                    'Master of Education',
                    'Bachelor of Science',
                    'Doctor of Philosophy',
                    'Master of Arts',
                    'Bachelor of Arts',
                    'Master of Science',
                    'Diploma in Education',
                ]),
                hire_date: faker.date
                    .between({
                        from: '2015-01-01', // Longer hiring period for variety
                        to: `${currentYear}-08-31`,
                    })
                    .toISOString()
                    .split('T')[0],
            });
        }
        const teacherRecordIds = await knex('teachers')
            .insert(teachers)
            .returning('id');

        console.log(`✅ Created school community:
        - ${totalStudents} students (all with student role)
        - ${teacherUserIds.length} teachers (all with teacher role)`);

        // ================================================================
        // PHASE 6: CREATE COMPREHENSIVE DEMO DATA
        // ================================================================
        console.log('\n📚 Phase 6: Creating comprehensive demo data...');

        // Create Student Archives
        const archives = [];
        for (let i = 0; i < studentRecordIds.length; i++) {
            const student = students[i];
            const studentId = studentRecordIds[i].id || studentRecordIds[i];

            // Create archive for ALL academic years to ensure coverage
            for (const academicYear of academicYearIds) {
                const academicYearId = academicYear.id || academicYear;
                archives.push({
                    student_id: studentId,
                    academic_year_id: academicYearId,
                    remaining_tuition: faker.number.float({
                        min: 0,
                        max: 3000,
                        fractionDigits: 2,
                    }),
                });
            }
        }
        const archiveIds = await knex('archives')
            .insert(archives)
            .returning('id');

        // Create Questions for Each Subject (EXPANDED for comprehensive testing)
        const questions = [];
        const questionsBySubject = {};

        for (const subject of subjectIds) {
            const subjectId = subject.id || subject;
            questionsBySubject[subjectId] = [];

            const questionCount = 20; // 20 questions per subject (15 subjects × 20 = 300 questions)
            for (let i = 0; i < questionCount; i++) {
                const questionText = generateQuestionForSubject(
                    subjectData.find(
                        (s) => (s.id || subjectIds.indexOf(s)) === subjectId
                    )?.name || 'General'
                );

                questions.push({
                    subject_id: subjectId,
                    question_text: questionText,
                    type: 'mcq', // Variety in question types
                });
            }
        }

        const questionIds = await knex('questions')
            .insert(questions)
            .returning('id');

        // Create Options for Questions
        const options = [];
        for (let i = 0; i < questionIds.length; i++) {
            const questionId = questionIds[i].id || questionIds[i];

            // Create 4 options per question
            const optionTexts = [
                'Option A - Correct answer',
                'Option B - Incorrect',
                'Option C - Incorrect',
                'Option D - Incorrect',
            ];

            for (let j = 0; j < 4; j++) {
                options.push({
                    question_id: questionId,
                    text: optionTexts[j],
                    is_correct: j === 0, // First option is correct
                });
            }
        }
        await knex('options').insert(options);

        // Create Exams (EXPANDED for comprehensive API testing)
        const exams = [];
        const examTypes = [
            { type: 'exam', title: 'Midterm Exam', marks: 100, time: 120 },
            { type: 'exam', title: 'Final Exam', marks: 150, time: 180 },
            { type: 'quiz', title: 'Quiz', marks: 25, time: 30 },
            { type: 'exam', title: 'Unit Test', marks: 50, time: 60 },
        ];

        for (const subject of subjectIds) {
            const subjectId = subject.id || subject;
            const subjectName = subjectData.find(
                (s) => (s.id || subjectIds.indexOf(s)) === subjectId
            )?.name;

            // Create multiple exam types per subject across different semesters
            for (const semester of semesterIds.slice(0, 4)) {
                // Use more semesters
                const semesterId = semester.id || semester;

                for (const examType of examTypes) {
                    if (examType.type === 'quiz')
                        exams.push({
                            subject_id: subjectId,
                            semester_id: semesterId,
                            title: `${examType.title} - ${subjectName}`,
                            description: `${examType.title} for ${subjectName} covering semester material`,
                            exam_type: examType.type,
                            time_limit: examType.time,
                            total_mark: examType.marks,
                            passing_mark: Math.floor(examType.marks * 0.6), // 60% passing
                            start_datetime: faker.date
                                .between({
                                    from: `${currentYear}-01-01`,
                                    to: `${currentYear}-06-30`,
                                })
                                .toISOString(),
                            end_datetime: faker.date
                                .between({
                                    from: `${currentYear + 1}-01-01`,
                                    to: `${currentYear + 1}-06-30`,
                                })
                                .toISOString(),
                        });
                    else
                        exams.push({
                            subject_id: subjectId,
                            semester_id: semesterId,
                            title: `${examType.title} - ${subjectName}`,
                            description: `${examType.title} for ${subjectName} covering semester material`,
                            exam_type: examType.type,
                            time_limit: examType.time,
                            total_mark: examType.marks,
                            passing_mark: Math.floor(examType.marks * 0.6), // 60% passing
                            start_datetime: faker.date
                                .between({
                                    from: `${currentYear}-01-01`,
                                    to: `${currentYear}-06-30`,
                                })
                                .toISOString(),
                            end_datetime: faker.date
                                .between({
                                    from: `${currentYear + 1}-01-01`,
                                    to: `${currentYear + 1}-06-30`,
                                })
                                .toISOString(),
                        });
                }
            }
        }
        const examIds = await knex('exams').insert(exams).returning('id');

        // Create Exam-Question relationships
        const examQuestions = [];
        for (let i = 0; i < examIds.length; i++) {
            const examId = examIds[i].id || examIds[i];
            const exam = exams[i];

            // Find questions for this subject
            const subjectQuestions = questionIds.filter(
                (_, idx) => questions[idx].subject_id === exam.subject_id
            );

            // Add 3 questions per exam (manageable size)
            const questionsToAdd = subjectQuestions.slice(0, 3);
            for (const questionId of questionsToAdd) {
                examQuestions.push({
                    exam_id: examId,
                    question_id: questionId.id || questionId,
                    mark: faker.number.int({ min: 5, max: 10 }),
                });
            }
        }
        await knex('exam_question').insert(examQuestions);

        // Create Exam Attempts (EXPANDED for comprehensive testing)
        const examAttempts = [];
        const attemptCount = Math.min(1500, studentRecordIds.length * 4); // More attempts per student

        for (let i = 0; i < attemptCount; i++) {
            const studentId =
                studentRecordIds[i % studentRecordIds.length].id ||
                studentRecordIds[i % studentRecordIds.length];
            const examId =
                examIds[i % examIds.length].id || examIds[i % examIds.length];

            // Get the exam to determine realistic score ranges
            const exam = exams[i % exams.length];
            const totalMarks = exam.total_mark;
            const passingMarks = exam.passing_mark;

            // Create realistic score distribution (80% pass, 20% fail)
            const willPass = Math.random() < 0.8;
            const score = willPass
                ? faker.number.int({ min: passingMarks, max: totalMarks })
                : faker.number.int({ min: 0, max: passingMarks - 1 });

            examAttempts.push({
                student_id: studentId,
                exam_id: examId,
                score: score,
            });
        }
        await knex('exam_attempts').insert(examAttempts);

        // Create Grades (MASSIVE expansion for comprehensive API testing)
        const grades = [];
        const gradeCount = Math.min(2000, archiveIds.length * 5); // Multiple grades per student

        for (let i = 0; i < gradeCount; i++) {
            const archiveId =
                archiveIds[i % archiveIds.length].id ||
                archiveIds[i % archiveIds.length]; // Use actual archive IDs
            const subjectId =
                subjectIds[i % subjectIds.length].id ||
                subjectIds[i % subjectIds.length];
            const semesterId =
                semesterIds[i % semesterIds.length].id ||
                semesterIds[i % semesterIds.length];

            const gradeType = faker.helpers.arrayElement([
                'worksheet',
                'exam',
                'quiz',
                'assignment',
            ]);

            // Create realistic grade distributions
            const maxScore =
                gradeType === 'quiz'
                    ? 25
                    : gradeType === 'assignment'
                    ? 50
                    : 100;
            const minScore = 0;

            // 70% students get good grades (70-100%), 20% average (50-70%), 10% poor (below 50%)
            const gradeCategory = faker.helpers.weightedArrayElement([
                { weight: 70, value: 'good' },
                { weight: 20, value: 'average' },
                { weight: 10, value: 'poor' },
            ]);

            let grade;
            switch (gradeCategory) {
                case 'good':
                    grade = faker.number.float({
                        min: maxScore * 0.7,
                        max: maxScore,
                        fractionDigits: 2,
                    });
                    break;
                case 'average':
                    grade = faker.number.float({
                        min: maxScore * 0.5,
                        max: maxScore * 0.7,
                        fractionDigits: 2,
                    });
                    break;
                case 'poor':
                    grade = faker.number.float({
                        min: 0,
                        max: maxScore * 0.5,
                        fractionDigits: 2,
                    });
                    break;
                default:
                    grade = faker.number.float({
                        min: maxScore * 0.6,
                        max: maxScore,
                        fractionDigits: 2,
                    });
            }

            grades.push({
                archive_id: archiveId,
                subject_id: subjectId,
                semester_id: semesterId,
                type: gradeType,
                grade: grade,
                min_score: minScore,
                max_score: maxScore,
            });
        }
        await knex('grades').insert(grades);

        // Create Behavior Records (limited)
        const behaviors = [];
        const behaviorTypes = [
            'Good Behavior',
            'Behavior Concerns',
            'Social Skills',
            'Work Habits',
            'Academic Integrity',
            'Attendance Problems',
            'Exam Issues',
            'Practical Skills',
        ];
        const behaviorDescriptions = {
            'Good Behavior': [
                'Excellent participation in class discussion',
                'Helped classmate understand difficult concept',
                'Submitted high-quality assignment on time',
            ],
            'Behavior Concerns': [
                'Disrupted class with unnecessary talking',
                'Late submission of assignment without excuse',
            ],
            'Social Skills': [
                'Demonstrated leadership during group work',
                'Worked well in team activities',
            ],
            'Work Habits': [
                'Consistent effort in completing assignments',
                'Shows improvement in organization skills',
            ],
            'Academic Integrity': [
                'Followed all exam protocols properly',
                'Demonstrated honesty in assessment',
            ],
            'Attendance Problems': [
                'Multiple unexcused absences',
                'Frequent tardiness affecting learning',
            ],
            'Exam Issues': [
                'Required additional time for completion',
                'Showed signs of test anxiety',
            ],
            'Practical Skills': [
                'Excellent hands-on project completion',
                'Strong problem-solving abilities',
            ],
        };

        for (
            let i = 0;
            i < Math.min(300, studentRecordIds.length * 0.75);
            i++
        ) {
            // 75% of students have behavior records
            const studentId =
                studentRecordIds[i % studentRecordIds.length].id ||
                studentRecordIds[i % studentRecordIds.length];
            const teacherId =
                teacherUserIds[i % teacherUserIds.length].id ||
                teacherUserIds[i % teacherUserIds.length];
            const type = faker.helpers.arrayElement(behaviorTypes);
            const descriptions = behaviorDescriptions[type];

            behaviors.push({
                student_id: studentId,
                type: type,
                description: faker.helpers.arrayElement(descriptions),
                date: faker.date
                    .recent({ days: 90 })
                    .toISOString()
                    .split('T')[0],
                created_by: teacherId,
            });
        }
        await knex('behaviors').insert(behaviors);

        // ================================================================
        // PHASE 6A: CREATE DAYS AND PERIODS (MISSING CRITICAL DATA)
        // ================================================================
        console.log(
            '\n📅 Phase 6A: Creating days and periods for scheduling...'
        );

        // Create Days of the Week
        const days = [
            { name: 'sunday' },
            { name: 'monday' },
            { name: 'tuesday' },
            { name: 'wedenesday' }, // Note: keeping the typo from migration
            { name: 'thursday' },
        ];
        const dayIds = await knex('days').insert(days).returning('id');

        // Create School Periods (Class time slots)
        const periods = [
            { start_time: '08:00:00', end_time: '08:45:00' }, // Period 1
            { start_time: '08:50:00', end_time: '09:35:00' }, // Period 2
            { start_time: '09:40:00', end_time: '10:25:00' }, // Period 3
            { start_time: '10:30:00', end_time: '11:15:00' }, // Period 4 (before break)
            { start_time: '11:30:00', end_time: '12:15:00' }, // Period 5 (after break)
            { start_time: '12:20:00', end_time: '13:05:00' }, // Period 6
            { start_time: '13:10:00', end_time: '13:55:00' }, // Period 7
            { start_time: '14:00:00', end_time: '14:45:00' }, // Period 8
        ];
        const periodIds = await knex('periods').insert(periods).returning('id');

        console.log(`✅ Created scheduling infrastructure:
        - ${days.length} school days
        - ${periods.length} class periods`);

        // ================================================================
        // PHASE 6B: CREATE TEACHER-SUBJECT RELATIONSHIPS (CRITICAL)
        // ================================================================
        console.log('\n👨‍🏫 Phase 6B: Creating teacher-subject assignments...');

        const teacherSubjects = [];

        // Assign teachers to subjects based on their specialization
        for (let i = 0; i < teacherRecordIds.length; i++) {
            const teacherId = teacherRecordIds[i].id || teacherRecordIds[i];
            const teacher = teachers[i];

            // Find subjects that match teacher's specialization
            const matchingSubjects = subjectData.filter(
                (subject) =>
                    subject.name
                        .toLowerCase()
                        .includes(teacher.specialization.toLowerCase()) ||
                    teacher.specialization
                        .toLowerCase()
                        .includes(subject.name.toLowerCase())
            );

            if (matchingSubjects.length > 0) {
                // Assign teacher to their specialized subject
                for (const subject of matchingSubjects) {
                    const subjectIndex = subjectData.indexOf(subject);
                    const subjectId =
                        subjectIds[subjectIndex].id || subjectIds[subjectIndex];

                    teacherSubjects.push({
                        teacher_id: teacherId,
                        subject_id: subjectId,
                    });
                }
            } else {
                // If no exact match, assign to a random subject
                const randomSubjectIndex = Math.floor(
                    Math.random() * subjectIds.length
                );
                const subjectId =
                    subjectIds[randomSubjectIndex].id ||
                    subjectIds[randomSubjectIndex];

                teacherSubjects.push({
                    teacher_id: teacherId,
                    subject_id: subjectId,
                });
            }

            // Also assign some teachers to multiple subjects (realistic)
            if (Math.random() < 0.3) {
                // 30% chance of teaching multiple subjects
                const secondSubjectIndex = Math.floor(
                    Math.random() * subjectIds.length
                );
                const secondSubjectId =
                    subjectIds[secondSubjectIndex].id ||
                    subjectIds[secondSubjectIndex];

                // Avoid duplicate assignments
                const alreadyAssigned = teacherSubjects.some(
                    (ts) =>
                        ts.teacher_id === teacherId &&
                        ts.subject_id === secondSubjectId
                );

                if (!alreadyAssigned) {
                    teacherSubjects.push({
                        teacher_id: teacherId,
                        subject_id: secondSubjectId,
                    });
                }
            }
        }

        await knex('teachers_subjects').insert(teacherSubjects);

        // ================================================================
        // PHASE 6C: CREATE COMPREHENSIVE SCHEDULES
        // ================================================================
        console.log('\n🗓️ Phase 6C: Creating weekly class schedules...');

        const schedules = [];

        // Create schedules for each class
        for (const classId of classIds) {
            const classIdValue = classId.id || classId;

            // For each day of the week
            for (const dayId of dayIds) {
                const dayIdValue = dayId.id || dayId;

                // For each period (but not all periods every day)
                const periodsToSchedule = periodIds.slice(0, 6); // Use first 6 periods

                for (let p = 0; p < periodsToSchedule.length; p++) {
                    const periodId =
                        periodsToSchedule[p].id || periodsToSchedule[p];

                    // Get a random subject for this time slot
                    const subjectIndex =
                        (classIdValue + dayIdValue + p) % subjectIds.length;
                    const subjectId =
                        subjectIds[subjectIndex].id || subjectIds[subjectIndex];

                    // Find a teacher who teaches this subject
                    const availableTeachers = teacherSubjects.filter(
                        (ts) => ts.subject_id === subjectId
                    );

                    if (availableTeachers.length > 0) {
                        const randomTeacher =
                            faker.helpers.arrayElement(availableTeachers);

                        schedules.push({
                            class_id: classIdValue,
                            subject_id: subjectId,
                            day_id: dayIdValue,
                            period_id: periodId,
                            teacher_id: randomTeacher.teacher_id,
                        });
                    }
                }
            }
        }

        // Remove duplicates and insert
        const uniqueSchedules = schedules.filter((schedule, index, self) => {
            return (
                index ===
                self.findIndex(
                    (s) =>
                        s.class_id === schedule.class_id &&
                        s.day_id === schedule.day_id &&
                        s.period_id === schedule.period_id
                )
            );
        });

        await knex('schedules').insert(uniqueSchedules);

        // ================================================================
        // PHASE 6D: CREATE ATTENDANCE RECORDS (EXPANDED)
        // ================================================================
        console.log(
            '\n📊 Phase 6D: Creating comprehensive attendance records...'
        );

        const startDate = new Date(`${currentYear}-09-01`);
        const endDate = new Date(`${currentYear + 1}-05-30`); // Full school year

        // STUDENT ATTENDANCE
        const studentAttendanceRecords = [];
        const studentsWithAttendance = Math.floor(
            studentRecordIds.length * 0.8
        );
        const totalDays = 120; // ~6 months of school days

        for (let i = 0; i < studentsWithAttendance; i++) {
            const studentId = studentRecordIds[i].id || studentRecordIds[i];

            // Generate attendance records for multiple days
            for (let day = 0; day < totalDays; day += 2) {
                const attendanceDate = new Date(startDate);
                attendanceDate.setDate(startDate.getDate() + day);

                if (attendanceDate <= endDate) {
                    // Skip weekends (Saturday = 6, Sunday = 0)
                    const dayOfWeek = attendanceDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        studentAttendanceRecords.push({
                            student_id: studentId,
                            created_by:
                                teacherUserIds[
                                    Math.floor(
                                        Math.random() * teacherUserIds.length
                                    )
                                ].id || teacherUserIds[0].id,
                            date: attendanceDate.toISOString().split('T')[0],
                            status: faker.helpers.weightedArrayElement([
                                { weight: 85, value: 'present' },
                                { weight: 10, value: 'absent' },
                                { weight: 5, value: 'late' },
                            ]),
                        });
                    }
                }
            }
        }
        await knex('attendance_students').insert(studentAttendanceRecords);

        // TEACHER ATTENDANCE
        const teacherAttendanceRecords = [];
        const teachersWithAttendance = Math.floor(
            teacherRecordIds.length * 0.9
        ); // 90% of teachers

        for (let i = 0; i < teachersWithAttendance; i++) {
            const teacherId = teacherRecordIds[i].id || teacherRecordIds[i];

            // Generate attendance for 60 days
            for (let day = 0; day < 60; day += 1) {
                const attendanceDate = new Date(startDate);
                attendanceDate.setDate(startDate.getDate() + day);

                if (attendanceDate <= endDate) {
                    const dayOfWeek = attendanceDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        teacherAttendanceRecords.push({
                            teacher_id: teacherId,
                            created_by: systemUserIds[0].id || systemUserIds[0], // Admin creates
                            date: attendanceDate.toISOString().split('T')[0],
                            status: faker.helpers.weightedArrayElement([
                                { weight: 92, value: 'present' },
                                { weight: 5, value: 'absent' },
                                { weight: 3, value: 'late' },
                            ]),
                        });
                    }
                }
            }
        }
        await knex('attendance_teachers').insert(teacherAttendanceRecords);

        // EMPLOYEE ATTENDANCE (for managers and accountants)
        const employeeAttendanceRecords = [];
        const employeeUsers = systemUserIds.slice(-10); // Last 10 are managers + accountants

        for (const userId of employeeUsers) {
            const userIdValue = userId.id || userId;

            // Generate attendance for 80 days
            for (let day = 0; day < 80; day += 1) {
                const attendanceDate = new Date(startDate);
                attendanceDate.setDate(startDate.getDate() + day);

                if (attendanceDate <= endDate) {
                    const dayOfWeek = attendanceDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        employeeAttendanceRecords.push({
                            user_id: userIdValue,
                            created_by: systemUserIds[0].id || systemUserIds[0], // Admin creates
                            date: attendanceDate.toISOString().split('T')[0],
                            status: faker.helpers.weightedArrayElement([
                                { weight: 95, value: 'present' },
                                { weight: 3, value: 'absent' },
                                { weight: 2, value: 'late' },
                            ]),
                        });
                    }
                }
            }
        }
        await knex('attendance_employees').insert(employeeAttendanceRecords);

        // Create Tuition Payments (EXPANDED for comprehensive testing)
        const tuitionPayments = [];
        const studentsWithPayments = Math.min(
            350,
            Math.floor(studentRecordIds.length * 0.9)
        ); // 90% of students have payments

        for (let i = 0; i < studentsWithPayments; i++) {
            const studentId =
                studentRecordIds[i % studentRecordIds.length].id ||
                studentRecordIds[i % studentRecordIds.length];

            // Create 2-4 payments per student (realistic payment plans)
            const paymentCount = faker.helpers.arrayElement([2, 3, 4]);
            for (let payment = 1; payment <= paymentCount; payment++) {
                tuitionPayments.push({
                    student_id: studentId,
                    amount: faker.number.float({
                        min: 2000,
                        max: 5000,
                        fractionDigits: 2,
                    }),
                    payment_date: faker.date
                        .between({
                            from: `${currentYear}-09-01`,
                            to: `${currentYear + 1}-06-30`,
                        })
                        .toISOString()
                        .split('T')[0],
                    payment_method: faker.helpers.arrayElement([
                        'cash',
                        'bank_transfer',
                    ]),
                    verified_by: teacherUserIds[0].id || teacherUserIds[0], // First teacher verifies
                    archive_id:
                        archiveIds[i % archiveIds.length].id ||
                        archiveIds[i % archiveIds.length],
                });
            }
        }
        await knex('tuition_payments').insert(tuitionPayments);

        // ================================================================
        // PHASE 6E: CREATE NOTIFICATIONS (MISSING DATA)
        // ================================================================
        console.log('\n📢 Phase 6E: Creating notifications for all users...');

        const notifications = [];
        const allUserIds = [...systemUserIds, ...schoolUserIds];

        // Notification templates
        const notificationTemplates = {
            student: [
                {
                    title: '📚 New Assignment Posted',
                    body: 'Your teacher has posted a new assignment in Mathematics. Due date: Next Friday.',
                },
                {
                    title: '📝 Exam Reminder',
                    body: 'You have an upcoming exam in Physics on Monday at 10:00 AM. Please prepare accordingly.',
                },
                {
                    title: '🎉 Grade Published',
                    body: 'Your grade for the recent Chemistry quiz has been published. Check your score card for details.',
                },
                {
                    title: '⚠️ Attendance Notice',
                    body: 'Please note that you have been marked absent for 3 consecutive days. Contact your teacher if this is an error.',
                },
                {
                    title: '💰 Payment Reminder',
                    body: 'Your tuition payment for this semester is due in 5 days. Please make the payment to avoid late fees.',
                },
            ],
            teacher: [
                {
                    title: '📋 Grade Submission Reminder',
                    body: 'Please submit grades for your recent Mathematics exam by Friday end of day.',
                },
                {
                    title: '👨‍🎓 Student Query',
                    body: 'A student from Grade 10-A has submitted a question about the assignment. Please review and respond.',
                },
                {
                    title: '📅 Schedule Update',
                    body: 'Your teaching schedule for next week has been updated. Please check the new time slots.',
                },
                {
                    title: '🏫 Faculty Meeting',
                    body: 'Faculty meeting scheduled for tomorrow at 2:00 PM in the main conference room.',
                },
            ],
            admin: [
                {
                    title: '📊 Monthly Report Ready',
                    body: 'The monthly academic and financial report is now available for review in the admin dashboard.',
                },
                {
                    title: '⚙️ System Maintenance',
                    body: 'Scheduled system maintenance will occur this Sunday from 2:00 AM to 4:00 AM.',
                },
                {
                    title: '👥 New Staff Orientation',
                    body: 'New staff orientation session is scheduled for next Monday. Please prepare welcome materials.',
                },
            ],
            general: [
                {
                    title: '🎊 School Event',
                    body: 'Annual Science Fair will be held next month. Students can start preparing their projects.',
                },
                {
                    title: '📢 Important Announcement',
                    body: 'The school will be closed tomorrow due to a national holiday. Classes will resume the day after.',
                },
                {
                    title: '🍽️ Cafeteria Menu Update',
                    body: 'New healthy menu options are now available in the school cafeteria. Check out the fresh additions!',
                },
            ],
        };

        // Create notifications for all users
        for (const userId of allUserIds) {
            const userIdValue = userId.id || userId;

            // Get user role to determine notification type
            const user =
                systemUsers.find(
                    (u) =>
                        u.role_id === adminRole.id &&
                        userIdValue <= systemUserIds.length
                ) ||
                studentUsers.find(
                    (_, idx) =>
                        studentUserIds[idx] &&
                        (studentUserIds[idx].id || studentUserIds[idx]) ===
                            userIdValue
                ) ||
                teacherUsers.find(
                    (_, idx) =>
                        teacherUserIds[idx] &&
                        (teacherUserIds[idx].id || teacherUserIds[idx]) ===
                            userIdValue
                );

            let userType = 'general';
            if (userIdValue <= 4)
                userType = 'admin'; // First 4 are admin/demo users
            else if (userIdValue <= systemUserIds.length)
                userType = 'general'; // Managers/accountants
            else if (
                userIdValue <=
                systemUserIds.length + studentUserIds.length
            )
                userType = 'student';
            else userType = 'teacher';

            const templates =
                notificationTemplates[userType] ||
                notificationTemplates.general;

            // Create 2-5 notifications per user
            const notificationCount = faker.number.int({ min: 2, max: 5 });

            for (let i = 0; i < notificationCount; i++) {
                const template = faker.helpers.arrayElement(templates);

                notifications.push({
                    user_id: userIdValue,
                    title: template.title,
                    body: template.body,
                    is_read: faker.helpers.weightedArrayElement([
                        { weight: 60, value: false }, // 60% unread
                        { weight: 40, value: true }, // 40% read
                    ]),
                    sent_at: faker.date.between({
                        from: `${currentYear}-01-01`,
                        to: faker.date.future(),
                    }),
                });
            }
        }

        await knex('notifications').insert(notifications);

        console.log(`✅ Created COMPREHENSIVE demo data for extensive API testing:
        - ${days.length} school days
        - ${periods.length} class periods
        - ${teacherSubjects.length} teacher-subject assignments
        - ${uniqueSchedules.length} class schedules
        - ${studentAttendanceRecords.length} student attendance records
        - ${teacherAttendanceRecords.length} teacher attendance records
        - ${employeeAttendanceRecords.length} employee attendance records
        - ${notifications.length} notifications for all users
        - ${archives.length} student archives
        - ${questions.length} questions with ${options.length} options  
        - ${exams.length} exams with ${examQuestions.length} question associations
        - ${examAttempts.length} exam attempts
        - ${grades.length} grade records across all subjects/semesters
        - ${behaviors.length} behavior records
        - ${tuitionPayments.length} tuition payments with various methods`);

        // ================================================================
        // PHASE 6F: CREATE FCM TOKENS FOR NOTIFICATIONS
        // ================================================================
        console.log(
            '\n📱 Phase 6F: Creating FCM tokens for push notifications...'
        );

        const fcmTokens = [];

        // Create FCM tokens for 80% of users (realistic mobile app usage)
        const usersWithTokens = Math.floor(allUserIds.length * 0.8);

        for (let i = 0; i < usersWithTokens; i++) {
            const userId = allUserIds[i % allUserIds.length];
            const userIdValue = userId.id || userId;

            fcmTokens.push({
                user_id: userIdValue,
                token: `fake_fcm_token_${userIdValue}_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                device_type: faker.helpers.arrayElement(['android', 'ios']),
                is_active: faker.helpers.weightedArrayElement([
                    { weight: 90, value: true }, // 90% active
                    { weight: 10, value: false }, // 10% inactive
                ]),
            });
        }

        await knex('fcm_tokens').insert(fcmTokens);

        // ================================================================
        // PHASE 7: FINAL VERIFICATION
        // ================================================================
        console.log('\n✅ Phase 7: Final verification...');

        // Verify all users have role_id
        const usersWithoutRole = await knex('users')
            .whereNull('role_id')
            .count('* as count');
        const totalUsers = await knex('users').count('* as count');
        const roleDistribution = await knex('users')
            .join('roles', 'users.role_id', 'roles.id')
            .groupBy('roles.name')
            .select('roles.name', knex.raw('COUNT(*) as count'));

        console.log(`📊 Final Statistics:
        - Total users: ${totalUsers[0].count}
        - Users without role_id: ${usersWithoutRole[0].count}
        
        Role Distribution:`);

        roleDistribution.forEach((role) => {
            console.log(`        - ${role.name}: ${role.count} users`);
        });

        console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n📝 Default Login Credentials:');
        console.log('- Admin: admin@system.com / Admin123');
        console.log('- Student: student@system.com / Student123');
        console.log('- Teacher: teacher@system.com / Teacher123');
        console.log('- Manager: manager1@system.com / Manager123');
        console.log('- Accountant: accountant1@system.com / Accountant123');
    } catch (error) {
        console.error('\n❌ ERROR during seeding:', error.message);
        console.error(error.stack);
        throw error;
    }
};

// Helper function to generate subject-specific questions
function generateQuestionForSubject(subjectName) {
    const questionTemplates = {
        Mathematics: [
            'What is the derivative of x²?',
            'Solve for x: 2x + 5 = 13',
            'What is the area of a circle with radius 5?',
            'If sin(θ) = 0.5, what is θ in degrees?',
            'What is the quadratic formula?',
            'Simplify: (3x + 2)(x - 1)',
        ],
        'English Literature': [
            'Who wrote "Romeo and Juliet"?',
            'What is a metaphor?',
            'Identify the main theme of "To Kill a Mockingbird"',
            'What is the difference between irony and sarcasm?',
            'Who is the protagonist in "The Great Gatsby"?',
            'What literary device is used in "The wind whispered"?',
        ],
        Physics: [
            "What is Newton's first law of motion?",
            'Calculate the velocity of a falling object after 3 seconds',
            'What is the speed of light in vacuum?',
            'Explain the photoelectric effect',
            'What is the unit of electric current?',
            'Define kinetic energy',
        ],
        Chemistry: [
            'What is the atomic number of Carbon?',
            'Balance the equation: H₂ + O₂ → H₂O',
            'What is the pH of pure water?',
            'Explain the concept of molarity',
            'What type of bond exists in NaCl?',
            'Define oxidation and reduction',
        ],
        Biology: [
            'What is the powerhouse of the cell?',
            'Explain the process of photosynthesis',
            'How many chromosomes does a human have?',
            'What is DNA?',
            'Describe the function of red blood cells',
            'What are the main parts of a neuron?',
        ],
        History: [
            'When did World War II end?',
            'Who was the first President of the United States?',
            'What caused the French Revolution?',
            'When was the Declaration of Independence signed?',
            'Who built the first transcontinental railroad?',
            'What was the Cold War?',
        ],
        Geography: [
            'What is the capital of Australia?',
            'Which river is the longest in the world?',
            'What are tectonic plates?',
            'Explain the water cycle',
            'What causes earthquakes?',
            'Name the seven continents',
        ],
        'Computer Science': [
            'What is an algorithm?',
            'Explain object-oriented programming',
            'What is the difference between RAM and ROM?',
            'What does HTML stand for?',
            'What is a database?',
            'Explain the concept of recursion',
        ],
    };

    const questions =
        questionTemplates[subjectName] || questionTemplates['Mathematics'];
    return faker.helpers.arrayElement(questions);
}
