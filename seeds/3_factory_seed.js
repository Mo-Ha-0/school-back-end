const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt-nodejs');

exports.seed = async function (knex) {
    console.log('seeding factory');

    // Clear tables in correct order (respecting foreign key dependencies)
    await knex('attendance_students').del();
    await knex('answers').del();
    await knex('exam_attempts').del();
    await knex('exam_question').del();
    await knex('options').del();
    await knex('questions').del();
    await knex('exams').del();
    await knex('schedules').del();
    await knex('subjects').del();
    await knex('archives').del();
    await knex('students').del();
    await knex('teachers').del();
    await knex('periods').del();
    await knex('days').del();
    await knex('classes').del();
    await knex('semesters').del();
    await knex('academic_years').del();
    await knex('curriculums').del();

    console.log('seeding academic years');
    const academicYears = [];
    for (let i = 0; i < 3; i++) {
        const start = new Date();
        start.setFullYear(start.getFullYear() - i);
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);

        academicYears.push({
            start_year: start.toISOString().split('T')[0],
            end_year: end.toISOString().split('T')[0],
            full_tuition: 1000 * (i + 1),
        });
    }
    const academicYearIds = await knex('academic_years')
        .insert(academicYears)
        .returning('id');

    console.log('seeding semesters');
    const semesters = [];
    for (const academicYear of academicYearIds) {
        const yearId = academicYear.id || academicYear;

        // First semester
        const startDate1 = new Date('2024-09-01');
        const endDate1 = new Date('2025-01-31');

        // Second semester
        const startDate2 = new Date('2025-02-01');
        const endDate2 = new Date('2025-06-30');

        semesters.push(
            {
                start_date: startDate1.toISOString().split('T')[0],
                end_date: endDate1.toISOString().split('T')[0],
                academic_year_id: yearId,
                semester_name: 'Fall Semester',
            },
            {
                start_date: startDate2.toISOString().split('T')[0],
                end_date: endDate2.toISOString().split('T')[0],
                academic_year_id: yearId,
                semester_name: 'Spring Semester',
            }
        );
    }
    const semesterIds = await knex('semesters')
        .insert(semesters)
        .returning('id');

    console.log('seeding curriculums');
    const curriculums = [];
    for (let i = 0; i < 4; i++) {
        curriculums.push({
            level_grade: String(9 + i),
            is_active: true,
            created_by: null,
        });
    }
    const curriculumIds = await knex('curriculums')
        .insert(curriculums)
        .returning('id');

    console.log('seeding classes');
    const classes = [];
    for (let i = 0; i < 5; i++) {
        classes.push({
            class_name: `Grade ${faker.number.int({
                min: 9,
                max: 12,
            })}${faker.string.alpha({ length: 1, casing: 'upper' })}`,
            level_grade: faker.number.int({
                min: 9,
                max: 12,
            }),
            floor_number: faker.number.int({ min: 1, max: 4 }),
        });
    }
    const classIds = await knex('classes').insert(classes).returning('id');

    console.log('seeding days');
    const dayNames = ['sunday', 'monday', 'tuesday', 'wedenesday', 'thursday'];
    const days = dayNames.map((name) => ({ name }));
    const dayIds = await knex('days').insert(days).returning('id');

    console.log('seeding periods');
    const periods = [];
    let startHour = 8;
    let startMinute = 0;

    for (let i = 1; i <= 7; i++) {
        const endHour = startHour;
        const endMinute = startMinute + 45; // 45 minute classes

        periods.push({
            start_time: `${startHour.toString().padStart(2, '0')}:${startMinute
                .toString()
                .padStart(2, '0')}:00`,
            end_time: `${endHour.toString().padStart(2, '0')}:${endMinute
                .toString()
                .padStart(2, '0')}:00`,
        });

        // Add 15 minute break between classes
        startMinute += 60; // 45 + 15 = 60
        if (startMinute >= 60) {
            startHour += Math.floor(startMinute / 60);
            startMinute = startMinute % 60;
        }
    }
    const periodIds = await knex('periods').insert(periods).returning('id');

    console.log('seeding users');
    const users = [];
    const studentRole = await knex('roles').where({ name: 'student' }).first();
    const teacherRole = await knex('roles').where({ name: 'teacher' }).first();

    // Create student users
    for (let i = 0; i < 15; i++) {
        users.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password_hash: bcrypt.hashSync('password123'),
            role_id: studentRole.id,
            phone: faker.phone.number(),
            birth_date: faker.date
                .birthdate({ min: 2005, max: 2010, mode: 'year' })
                .toISOString()
                .split('T')[0],
        });
    }

    // Create teacher users
    for (let i = 0; i < 5; i++) {
        users.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password_hash: bcrypt.hashSync('password123'),
            role_id: teacherRole.id,
            phone: faker.phone.number(),
            birth_date: faker.date
                .birthdate({ min: 1980, max: 1995, mode: 'year' })
                .toISOString()
                .split('T')[0],
        });
    }
    const userIds = await knex('users').insert(users).returning('id');

    console.log('seeding students');
    const students = [];
    for (let i = 0; i < 15; i++) {
        students.push({
            user_id: userIds[i].id || userIds[i],
            class_id:
                faker.helpers.arrayElement(classIds).id ||
                faker.helpers.arrayElement(classIds),
            curriculum_id:
                faker.helpers.arrayElement(curriculumIds).id ||
                faker.helpers.arrayElement(curriculumIds),
            grade_level: faker.helpers.arrayElement([9, 10, 11, 12]),
        });
    }
    const studentIds = await knex('students').insert(students).returning('id');

    console.log('seeding archives for students');
    const latestAcademicYear = await knex('academic_years')
        .orderBy('start_year', 'desc')
        .first();
    if (latestAcademicYear) {
        const studentArchives = [];
        for (const studentId of studentIds) {
            const sId = studentId.id || studentId;
            studentArchives.push({
                student_id: sId,
                academic_year_id: latestAcademicYear.id,
                remaining_tuition: latestAcademicYear.full_tuition || 0,
            });
        }
        await knex('archives').insert(studentArchives);
    }

    console.log('seeding teachers');
    const teachers = [];
    for (let i = 0; i < 5; i++) {
        teachers.push({
            user_id: userIds[15 + i].id || userIds[15 + i],
            specialization: faker.person.jobArea(),
            hire_date: faker.date
                .past({ years: 10 })
                .toISOString()
                .split('T')[0],
            qualification: faker.helpers.arrayElement([
                'Bachelor',
                'Master',
                'PhD',
            ]),
        });
    }
    const teacherIds = await knex('teachers').insert(teachers).returning('id');

    console.log('seeding subjects');
    const subjectNames = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'Arabic',
        'History',
        'Geography',
    ];
    const subjects = [];

    for (let i = 0; i < subjectNames.length; i++) {
        subjects.push({
            name: subjectNames[i],
            resources: faker.internet.url(),
            // teacher_id:
            //     faker.helpers.arrayElement(teacherIds).id ||
            //     faker.helpers.arrayElement(teacherIds),
            curriculum_id:
                faker.helpers.arrayElement(curriculumIds).id ||
                faker.helpers.arrayElement(curriculumIds),
        });
    }
    const subjectIds = await knex('subjects').insert(subjects).returning('id');

    console.log('seeding exams (exams and quizzes)');
    const exams = [];
    const now = new Date();

    const pickId = (arr) =>
        arr[0] && arr[0].id !== undefined
            ? faker.helpers.arrayElement(arr).id
            : faker.helpers.arrayElement(arr);

    // Helper to generate a date in the past
    const randomPastDate = () =>
        faker.date.between({
            from: new Date(
                now.getTime() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            to: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        });

    // Helper to generate a date in the future
    const randomFutureDate = () =>
        faker.date.between({
            from: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            to: new Date(
                now.getTime() + 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
        });

    const buildExam = (type, when) => {
        const start = when === 'past' ? randomPastDate() : randomFutureDate();
        const end = new Date(start);
        end.setHours(end.getHours() + faker.number.int({ min: 1, max: 3 }));
        return {
            subject_id: pickId(subjectIds),
            semester_id: pickId(semesterIds),
            title: `${type === 'quiz' ? 'Quiz' : 'Exam'} ${faker.lorem.words(
                2
            )}`,
            description: faker.lorem.sentence(),
            time_limit:
                type === 'quiz'
                    ? faker.number.int({ min: 10, max: 45 })
                    : faker.number.int({ min: 60, max: 180 }),
            total_mark: 100,
            passing_mark: 50,
            start_datetime: start.toISOString(),
            end_datetime: end.toISOString(),
            announced: true,
            exam_type: type,
        };
    };

    // Past exams (ended, announced) - for semester history endpoints
    for (let i = 0; i < 6; i++) {
        exams.push(buildExam('exam', 'past'));
        exams.push(buildExam('quiz', 'past'));
    }

    // Upcoming (future) exams/quizzes (announced) - for next endpoints
    for (let i = 0; i < 6; i++) {
        exams.push(buildExam('exam', 'future'));
        exams.push(buildExam('quiz', 'future'));
    }

    const examIds = await knex('exams').insert(exams).returning('id');

    console.log('seeding schedules');
    const schedules = [];
    const usedClassKeys = new Set();
    const usedSubjectKeys = new Set();
    let scheduleAttempts = 0;

    while (schedules.length < 10 && scheduleAttempts < 200) {
        const class_id =
            faker.helpers.arrayElement(classIds).id ||
            faker.helpers.arrayElement(classIds);
        const subject_id =
            faker.helpers.arrayElement(subjectIds).id ||
            faker.helpers.arrayElement(subjectIds);
        const day_id =
            faker.helpers.arrayElement(dayIds).id ||
            faker.helpers.arrayElement(dayIds);
        const period_id =
            faker.helpers.arrayElement(periodIds).id ||
            faker.helpers.arrayElement(periodIds);
        const teacher_id =
            faker.helpers.arrayElement(teacherIds).id ||
            faker.helpers.arrayElement(teacherIds);

        const classKey = `${class_id}_${day_id}_${period_id}`;
        const subjectKey = `${subject_id}_${day_id}_${period_id}`;

        if (!usedClassKeys.has(classKey) && !usedSubjectKeys.has(subjectKey)) {
            schedules.push({
                class_id,
                subject_id,
                day_id,
                period_id,
                teacher_id,
            });
            usedClassKeys.add(classKey);
            usedSubjectKeys.add(subjectKey);
        }
        scheduleAttempts++;
    }

    const scheduleIds = await knex('schedules')
        .insert(schedules)
        .returning('id');

    // console.log('seeding exams');
    // const exams = [];
    // for (let i = 0; i < 10; i++) {
    //     const startDateTime = faker.date.between({
    //         from: '2020-01-01T00:00:00.000Z',
    //         to: '2030-01-01T00:00:00.000Z',
    //     });
    //     const endDateTime = new Date(startDateTime);
    //     endDateTime.setHours(startDateTime.getHours() + 2);

    //     exams.push({
    //         subject_id:
    //             faker.helpers.arrayElement(subjectIds).id ||
    //             faker.helpers.arrayElement(subjectIds),
    //         semester_id:
    //             faker.helpers.arrayElement(semesterIds).id ||
    //             faker.helpers.arrayElement(semesterIds),
    //         title: faker.lorem.words(3),
    //         description: faker.lorem.sentence(),
    //         time_limit: faker.number.int({ min: 60, max: 180 }),
    //         total_mark: 100,
    //         passing_mark: 50,
    //         start_datetime: startDateTime.toISOString(),
    //         end_datetime: endDateTime.toISOString(),
    //         announced: faker.datatype.boolean(),
    //     });
    // }
    // const examIds = await knex('exams').insert(exams).returning('id');

    console.log('seeding questions');
    const questions = [];
    for (let i = 0; i < 30; i++) {
        questions.push({
            subject_id:
                faker.helpers.arrayElement(subjectIds).id ||
                faker.helpers.arrayElement(subjectIds),
            question_text: faker.lorem.sentence() + '?',
            type: faker.helpers.arrayElement(['mcq', 'true_false']),
        });
    }
    const questionIds = await knex('questions')
        .insert(questions)
        .returning('id');

    console.log('seeding options');
    const options = [];
    for (const questionId of questionIds) {
        const qId = questionId.id || questionId;
        const numOptions = faker.number.int({ min: 2, max: 4 });
        const correctIndex = faker.number.int({ min: 0, max: numOptions - 1 });

        for (let i = 0; i < numOptions; i++) {
            options.push({
                question_id: qId,
                text: faker.lorem.words(3),
                is_correct: i === correctIndex,
            });
        }
    }
    const optionIds = await knex('options').insert(options).returning('id');

    // Assign database IDs to options
    for (let i = 0; i < options.length; i++) {
        options[i].id = optionIds[i].id;
    }

    console.log('seeding exam_question');
    const examQuestions = [];
    for (const examId of examIds) {
        const eId = examId.id || examId;
        const numQuestions = faker.number.int({ min: 5, max: 10 });
        const selectedQuestions = faker.helpers.arrayElements(
            questionIds,
            numQuestions
        );

        for (const questionId of selectedQuestions) {
            const qId = questionId.id || questionId;
            examQuestions.push({
                exam_id: eId,
                question_id: qId,
                mark: faker.number.int({ min: 5, max: 15 }),
            });
        }
    }
    const examQuestionIds = await knex('exam_question')
        .insert(examQuestions)
        .returning('id');

    console.log('seeding exam_attempts');
    const examAttempts = [];
    for (let i = 0; i < 20; i++) {
        const score = faker.datatype.boolean()
            ? faker.number.int({ min: 0, max: 100 })
            : null;

        examAttempts.push({
            exam_id:
                faker.helpers.arrayElement(examIds).id ||
                faker.helpers.arrayElement(examIds),
            student_id:
                faker.helpers.arrayElement(studentIds).id ||
                faker.helpers.arrayElement(studentIds),
            score: score,
        });
    }
    const examAttemptIds = await knex('exam_attempts')
        .insert(examAttempts)
        .returning('id');

    console.log('seeding answers');
    const answers = [];
    for (let i = 0; i < Math.min(10, examAttemptIds.length); i++) {
        const attemptId = examAttemptIds[i];
        const aId = attemptId.id || attemptId;
        const attempt = examAttempts[i];

        if (attempt) {
            const examId = attempt.exam_id;
            const relatedExamQuestions = examQuestions.filter(
                (eq) => eq.exam_id === examId
            );

            for (const examQuestion of relatedExamQuestions.slice(0, 3)) {
                const relatedOptions = options.filter(
                    (opt) => opt.question_id === examQuestion.question_id
                );
                if (relatedOptions.length > 0) {
                    const selectedOption =
                        faker.helpers.arrayElement(relatedOptions);

                    answers.push({
                        question_id: examQuestion.question_id,
                        option_id: selectedOption.id,
                        exam_attempt_id: aId,
                        mark_awarded: selectedOption.is_correct
                            ? examQuestion.mark
                            : 0,
                    });
                }
            }
        }
    }

    if (answers.length > 0) {
        await knex('answers').insert(answers);
    }

    // archives are created per-student above; skip additional random archives to avoid unique conflicts

    console.log('seeding attendance_students');
    const attendance = [];
    for (let i = 0; i < 30; i++) {
        attendance.push({
            student_id:
                faker.helpers.arrayElement(studentIds).id ||
                faker.helpers.arrayElement(studentIds),
            created_by:
                faker.helpers.arrayElement(userIds).id ||
                faker.helpers.arrayElement(userIds),
            date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
            status: faker.helpers.arrayElement(['present', 'absent', 'late']),
        });
    }
    await knex('attendance_students').insert(attendance);

    console.log('\x1b[32m%s\x1b[0m', 'Factory seeding completed successfully!');
};
