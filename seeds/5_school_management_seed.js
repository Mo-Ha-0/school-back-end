const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt-nodejs');

exports.seed = async function (knex) {
    console.log('Seeding school management data...');

    // Clear tables in correct order (respecting foreign key dependencies)
    await knex('grades').del();
    await knex('subjects').del();
    await knex('students').del();
    await knex('teachers').del();
    await knex('classes').del();
    await knex('users').del();

    console.log('Seeding users...');
    const users = [];
    const studentRole = await knex('roles').where({ name: 'student' }).first();
    const teacherRole = await knex('roles').where({ name: 'teacher' }).first();

    if (!studentRole || !teacherRole) {
        throw new Error(
            'Required roles (student, teacher) not found. Please run role seeds first.'
        );
    }

    // Generate 10 classes with 20-30 students each = 200-300 students
    const totalStudents = 250; // Average of 25 students per class
    const totalTeachers = 35; // 2-3 subjects per class, so we need enough teachers

    // Create student users with realistic demographics
    for (let i = 0; i < totalStudents; i++) {
        const gender = faker.helpers.arrayElement(['male', 'female']);
        const firstName =
            gender === 'male'
                ? faker.person.firstName('male')
                : faker.person.firstName('female');
        const lastName = faker.person.lastName();

        users.push({
            name: `${firstName} ${lastName}`,
            email: faker.internet.email({
                firstName,
                lastName,
                provider: 'school.edu',
            }),
            password_hash: bcrypt.hashSync('password123'),
            role_id: studentRole.id,
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

    // Create teacher users with realistic backgrounds
    const teacherNames = [
        'Dr. Sarah Johnson',
        'Prof. Michael Chen',
        'Ms. Emily Rodriguez',
        'Mr. David Thompson',
        'Dr. Lisa Wang',
        'Prof. James Wilson',
        'Ms. Maria Garcia',
        'Mr. Robert Brown',
        'Dr. Jennifer Lee',
        'Prof. Christopher Davis',
        'Ms. Amanda Taylor',
        'Mr. Kevin Martinez',
        'Dr. Rachel Green',
        'Prof. Daniel Anderson',
        'Ms. Jessica White',
        'Mr. Matthew Jackson',
        'Dr. Nicole Harris',
        'Prof. Andrew Clark',
        'Ms. Stephanie Lewis',
        'Mr. Joshua Hall',
        'Dr. Michelle Turner',
        'Prof. Brandon Scott',
        'Ms. Danielle Adams',
        'Mr. Ryan Baker',
        'Dr. Kimberly Nelson',
        'Prof. Jonathan Carter',
        'Ms. Ashley Mitchell',
        'Mr. Steven Roberts',
        'Dr. Amanda Campbell',
        'Prof. Timothy Phillips',
        'Ms. Brittany Evans',
        'Mr. Nathan Edwards',
        'Dr. Victoria Collins',
        'Prof. Gregory Stewart',
        'Ms. Samantha Morris',
    ];

    for (let i = 0; i < totalTeachers; i++) {
        users.push({
            name: teacherNames[i] || faker.person.fullName(),
            email: faker.internet.email({ provider: 'school.edu' }),
            password_hash: bcrypt.hashSync('password123'),
            role_id: teacherRole.id,
            phone: faker.phone.number('###-###-####'),
            birth_date: faker.date
                .birthdate({
                    min: 1980,
                    max: 1995,
                    mode: 'year',
                })
                .toISOString()
                .split('T')[0],
        });
    }

    const userIds = await knex('users').insert(users).returning('id');
    const studentUserIds = userIds.slice(0, totalStudents);
    const teacherUserIds = userIds.slice(totalStudents);

    console.log('Seeding classes...');
    const classes = [];
    const gradeLevels = [9, 10, 11, 12];
    const classSuffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    for (let i = 0; i < 10; i++) {
        const gradeLevel = gradeLevels[i % gradeLevels.length];
        const floorNumber = Math.ceil((gradeLevel - 8) / 2); // Grade 9-10: Floor 1, Grade 11-12: Floor 2

        classes.push({
            class_name: `Grade ${gradeLevel}${classSuffixes[i]}`,
            level_grade: gradeLevel,
            floor_number: floorNumber,
        });
    }

    const classIds = await knex('classes').insert(classes).returning('id');

    console.log('Seeding teachers...');
    const teachers = [];
    const subjectSpecializations = [
        {
            subject: 'Mathematics',
            qualifications: [
                'Bachelor of Mathematics',
                'Master of Education',
                'PhD in Mathematics Education',
            ],
        },
        {
            subject: 'English Literature',
            qualifications: [
                'Bachelor of English',
                'Master of Arts in Literature',
                'PhD in English',
            ],
        },
        {
            subject: 'Science',
            qualifications: [
                'Bachelor of Science',
                'Master of Science Education',
                'PhD in Science Education',
            ],
        },
        {
            subject: 'History',
            qualifications: [
                'Bachelor of History',
                'Master of Arts in History',
                'PhD in History',
            ],
        },
        {
            subject: 'Physics',
            qualifications: [
                'Bachelor of Physics',
                'Master of Physics',
                'PhD in Physics',
            ],
        },
        {
            subject: 'Chemistry',
            qualifications: [
                'Bachelor of Chemistry',
                'Master of Chemistry',
                'PhD in Chemistry',
            ],
        },
        {
            subject: 'Biology',
            qualifications: [
                'Bachelor of Biology',
                'Master of Biology',
                'PhD in Biology',
            ],
        },
        {
            subject: 'Computer Science',
            qualifications: [
                'Bachelor of Computer Science',
                'Master of Computer Science',
                'PhD in Computer Science',
            ],
        },
        {
            subject: 'Art',
            qualifications: [
                'Bachelor of Fine Arts',
                'Master of Fine Arts',
                'Teaching Certificate',
            ],
        },
        {
            subject: 'Music',
            qualifications: [
                'Bachelor of Music',
                'Master of Music',
                'Music Education Certificate',
            ],
        },
        {
            subject: 'Physical Education',
            qualifications: [
                'Bachelor of Physical Education',
                'Master of Sports Science',
                'Coaching Certificate',
            ],
        },
        {
            subject: 'Economics',
            qualifications: [
                'Bachelor of Economics',
                'Master of Economics',
                'PhD in Economics',
            ],
        },
        {
            subject: 'Psychology',
            qualifications: [
                'Bachelor of Psychology',
                'Master of Psychology',
                'PhD in Psychology',
            ],
        },
        {
            subject: 'Geography',
            qualifications: [
                'Bachelor of Geography',
                'Master of Geography',
                'PhD in Geography',
            ],
        },
    ];

    for (let i = 0; i < totalTeachers; i++) {
        const specialization =
            subjectSpecializations[i % subjectSpecializations.length];
        const hireYear = faker.number.int({ min: 2015, max: 2023 });
        const hireMonth = faker.number.int({ min: 1, max: 12 });
        const hireDay = faker.number.int({ min: 1, max: 28 });

        teachers.push({
            user_id: teacherUserIds[i].id || teacherUserIds[i],
            specialization: specialization.subject,
            hire_date: `${hireYear}-${hireMonth
                .toString()
                .padStart(2, '0')}-${hireDay.toString().padStart(2, '0')}`,
            qualification: faker.helpers.arrayElement(
                specialization.qualifications
            ),
        });
    }

    const teacherIds = await knex('teachers').insert(teachers).returning('id');

    console.log('Seeding students...');
    const students = [];
    const curriculums = await knex('curriculums').select('id');

    if (curriculums.length === 0) {
        throw new Error(
            'No curriculums found. Please run curriculum seeds first.'
        );
    }

    // Distribute students across classes with realistic distribution
    let studentIndex = 0;
    for (const classId of classIds) {
        const cId = classId.id || classId;
        const classInfo = classes.find((c) => (c.id || c) === cId);
        const gradeLevel = classInfo?.level_grade || 9;

        // Slightly more students in lower grades (realistic for most schools)
        const baseStudents = gradeLevel <= 10 ? 28 : 25;
        const studentsInClass = faker.number.int({
            min: baseStudents - 3,
            max: baseStudents + 2,
        });

        for (
            let i = 0;
            i < studentsInClass && studentIndex < totalStudents;
            i++
        ) {
            const studentUserId = studentUserIds[studentIndex];
            const sUserId = studentUserId.id || studentUserId;

            // Generate realistic parent names
            const parentFirstName = faker.person.firstName();
            const parentLastName = faker.person.lastName();
            const parentName = `${parentFirstName} ${parentLastName}`;

            students.push({
                user_id: sUserId,
                class_id: cId,
                grade_level: gradeLevel,
                curriculum_id:
                    curriculums.find(
                        (c) => c.level_grade === gradeLevel.toString()
                    )?.id || curriculums[0].id,
            });

            studentIndex++;
        }
    }

    const studentIds = await knex('students').insert(students).returning('id');

    console.log('Seeding subjects...');
    const subjectsData = [];
    const subjectNames = [
        'Algebra I',
        'Geometry',
        'Algebra II',
        'Pre-Calculus',
        'Calculus',
        'AP Calculus AB',
        'AP Calculus BC',
        'English 9',
        'English 10',
        'English 11',
        'English 12',
        'AP Literature',
        'AP Language',
        'Biology',
        'Chemistry',
        'Physics',
        'Environmental Science',
        'AP Biology',
        'AP Chemistry',
        'AP Physics',
        'World History',
        'US History',
        'Government',
        'Economics',
        'Geography',
        'AP World History',
        'AP US History',
        'Computer Programming',
        'Web Development',
        'Data Structures',
        'AP Computer Science A',
        'AP Computer Science Principles',
        'Art Fundamentals',
        'Drawing',
        'Painting',
        'Digital Art',
        'AP Studio Art',
        'Music Theory',
        'AP Music Theory',
        'Physical Education',
        'Health Education',
        'Psychology',
        'Sociology',
        'AP Psychology',
    ];

    // Create a mapping of subjects to grade levels
    const subjectGradeMapping = {
        9: [
            'Algebra I',
            'English 9',
            'Biology',
            'World History',
            'Physical Education',
        ],
        10: [
            'Geometry',
            'English 10',
            'Chemistry',
            'US History',
            'Art Fundamentals',
        ],
        11: [
            'Algebra II',
            'English 11',
            'Physics',
            'Government',
            'Computer Programming',
        ],
        12: [
            'Pre-Calculus',
            'English 12',
            'Environmental Science',
            'Economics',
            'AP Literature',
        ],
    };

    // Assign subjects to classes based on grade level
    for (const classId of classIds) {
        const cId = classId.id || classId;
        const classInfo = classes.find((c) => (c.id || c) === cId);
        const gradeLevel = classInfo?.level_grade || 9;

        // Get subjects for this grade level
        const gradeSubjects =
            subjectGradeMapping[gradeLevel] || subjectGradeMapping[9];

        // Add some elective subjects randomly
        const electiveSubjects = subjectNames.filter(
            (subject) => !gradeSubjects.includes(subject)
        );
        const additionalSubjects = faker.helpers.arrayElements(
            electiveSubjects,
            2
        );
        const allSubjects = [...gradeSubjects, ...additionalSubjects];

        for (const subjectName of allSubjects) {
            subjectsData.push({
                name: subjectName,
                curriculum_id:
                    curriculums.find(
                        (c) => c.level_grade === gradeLevel.toString()
                    )?.id || curriculums[0].id,
                resources: faker.helpers.arrayElement([
                    'Textbook, Online Resources, Lab Materials, Interactive Software',
                    'Digital Textbook, Virtual Labs, Assessment Tools, Video Resources',
                    'Workbook, Reference Materials, Videos, Hands-on Kits',
                    'Hands-on Materials, Field Trip Resources, Guest Speakers',
                    'Technology Tools, Assessment Materials, Online Platforms',
                    'Art Supplies, Studio Equipment, Digital Tools, Gallery Access',
                    'Musical Instruments, Practice Rooms, Recording Equipment, Performance Space',
                    'Sports Equipment, Gym Facilities, Outdoor Areas, Fitness Trackers',
                ]),
            });
        }
    }

    const subjectIds = await knex('subjects')
        .insert(subjectsData)
        .returning('id');

    // ===== PHASE 7: GRADE BOUNDARIES =====
    console.log('\n📊 Creating grade boundaries...');

    const grades = [];
    const gradeTypes = ['worksheet', 'exam', 'quiz', 'assignment'];

    // Get semesters for grade boundaries
    const semesterIds = await knex('semesters').select('id');

    // Create grade boundaries for each subject and semester
    for (const subjectId of subjectIds) {
        const sId = subjectId.id || subjectId;

        for (const semester of semesterIds) {
            const semesterId = semester.id || semester;

            // Create grade boundaries for each type
            for (const type of gradeTypes) {
                grades.push({
                    archive_id: null, // Will be set when archives are created
                    subject_id: sId,
                    semester_id: semesterId,
                    min_score: 0.0,
                    max_score: 100.0,
                    grade: 100.0,
                    type: type,
                });
            }
        }
    }

    if (grades.length > 0) {
        await knex('grades').insert(grades);
        console.log(
            `✓ Created ${grades.length} grade boundaries for all subjects and semesters`
        );
    } else {
        console.log('Note: No grade boundaries created');
    }

    // ===== PHASE 7.5: TEACHER-SUBJECT RELATIONSHIPS =====
    console.log('\n👨‍🏫 Creating teacher-subject relationships...');

    const teacherSubjectRelations = [];

    // Create relationships between teachers and subjects
    for (const teacher of teachers) {
        const teacherId = teacher.id || teacher;
        const teacherSpecialization = teacher.specialization;

        // Find subjects that match this teacher's specialization
        const matchingSubjects = subjectsData.filter((subject) => {
            const subjectName = subject.name.toLowerCase();
            const specialization = teacherSpecialization.toLowerCase();

            // Simple matching logic
            return (
                subjectName.includes(specialization) ||
                specialization.includes(subjectName.split(' ')[0]) ||
                (specialization === 'Mathematics' &&
                    (subjectName.includes('math') ||
                        subjectName.includes('algebra') ||
                        subjectName.includes('calculus'))) ||
                (specialization === 'Science' &&
                    (subjectName.includes('biology') ||
                        subjectName.includes('chemistry') ||
                        subjectName.includes('physics'))) ||
                (specialization === 'English Literature' &&
                    (subjectName.includes('english') ||
                        subjectName.includes('literature'))) ||
                (specialization === 'History' &&
                    (subjectName.includes('history') ||
                        subjectName.includes('world') ||
                        subjectName.includes('us')))
            );
        });

        // Assign 2-4 subjects to each teacher
        const subjectsToAssign = faker.helpers.arrayElements(
            matchingSubjects,
            Math.min(
                matchingSubjects.length,
                faker.number.int({ min: 2, max: 4 })
            )
        );

        for (const subject of subjectsToAssign) {
            // Find the corresponding subject ID from the inserted subjects
            const subjectId = subjectIds.find(
                (s) => s.id === subject.id || s.id === subject.id
            );
            if (subjectId) {
                const sId = subjectId.id || subjectId;

                teacherSubjectRelations.push({
                    teacher_id: teacherId,
                    subject_id: sId,
                });
            }
        }
    }

    if (teacherSubjectRelations.length > 0) {
        await knex('teachers_subjects').insert(teacherSubjectRelations);
        console.log(
            `✓ Created ${teacherSubjectRelations.length} teacher-subject relationships`
        );
    } else {
        console.log('Note: No teacher-subject relationships created');
    }

    console.log('School management seeding completed successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${classes.length} classes`);
    console.log(`Created ${teachers.length} teachers`);
    console.log(`Created ${students.length} students`);
    console.log(`Created ${subjectsData.length} subjects`);
    console.log(`Created ${grades.length} grades`);

    console.log('\nRealistic school scenarios created:');
    console.log('- 10 classes across 4 grade levels (9-12)');
    console.log('- 250 students with realistic demographics');
    console.log('- 35 teachers with subject specializations');
    console.log('- Grade-appropriate subjects and curriculums');
    console.log('- Realistic grade distributions (bell curve)');
    console.log('- Proper foreign key relationships maintained');
};
