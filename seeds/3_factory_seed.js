const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt-nodejs');

exports.seed = async function (knex) {
    console.log('Seeding academic infrastructure...');

    // Clear only academic infrastructure tables (not user/student/teacher data)
    await knex('attendance_students').del();
    await knex('answers').del();
    await knex('exam_attempts').del();
    await knex('exam_question').del();
    await knex('options').del();
    await knex('questions').del();
    await knex('exams').del();
    await knex('schedules').del();
    await knex('periods').del();
    await knex('days').del();
    await knex('semesters').del();
    await knex('academic_years').del();
    await knex('curriculums').del();

    console.log('Seeding academic years...');
    const academicYears = [];
    const currentYear = new Date().getFullYear();

    // Create 5 academic years (current + 4 previous)
    for (let i = 0; i < 5; i++) {
        const startYear = currentYear - i;
        const endYear = startYear + 1;

        academicYears.push({
            start_year: `${startYear}-09-01`,
            end_year: `${endYear}-06-30`,
            full_tuition: faker.number.int({ min: 8000, max: 15000 }),
        });
    }
    const academicYearIds = await knex('academic_years')
        .insert(academicYears)
        .returning('id');

    console.log('Seeding semesters...');
    const semesters = [];
    for (const academicYear of academicYearIds) {
        const yearId = academicYear.id || academicYear;
        const startYear = parseInt(
            academicYear.start_year?.split('-')[0] || currentYear
        );

        // Fall Semester (September - January)
        const fallStart = new Date(`${startYear}-09-01`);
        const fallEnd = new Date(`${startYear + 1}-01-31`);

        // Spring Semester (February - June)
        const springStart = new Date(`${startYear + 1}-02-01`);
        const springEnd = new Date(`${startYear + 1}-06-30`);

        // Summer Semester (July - August) - Optional
        const summerStart = new Date(`${startYear + 1}-07-01`);
        const summerEnd = new Date(`${startYear + 1}-08-31`);

        semesters.push(
            {
                start_date: fallStart.toISOString().split('T')[0],
                end_date: fallEnd.toISOString().split('T')[0],
                academic_year_id: yearId,
                semester_name: 'Fall Semester',
            },
            {
                start_date: springStart.toISOString().split('T')[0],
                end_date: springEnd.toISOString().split('T')[0],
                academic_year_id: yearId,
                semester_name: 'Spring Semester',
            },
            {
                start_date: summerStart.toISOString().split('T')[0],
                end_date: summerEnd.toISOString().split('T')[0],
                academic_year_id: yearId,
                semester_name: 'Summer Semester',
            }
        );
    }
    const semesterIds = await knex('semesters')
        .insert(semesters)
        .returning('id');

    console.log('Seeding curriculums...');
    const curriculums = [];
    const curriculumLevels = [
        { level: '9' },
        { level: '10' },
        { level: '11' },
        { level: '12' },
    ];

    for (const level of curriculumLevels) {
        curriculums.push({
            level_grade: level.level,
            is_active: true,
            created_by: null,
        });
    }
    const curriculumIds = await knex('curriculums')
        .insert(curriculums)
        .returning('id');

    console.log('Seeding school days...');
    const dayNames = [
        'sunday',
        'monday',
        'tuesday',
        'wedenesday', // Note: typo in migration, but must match exactly
        'thursday',
    ];
    const days = dayNames.map((name) => ({ name }));
    const dayIds = await knex('days').insert(days).returning('id');

    console.log('Seeding class periods...');
    const periods = [];
    const periodConfigs = [
        { start: '8:00', end: '8:45' },
        { start: '8:50', end: '9:35' },
        { start: '9:40', end: '10:25' },
        { start: '10:30', end: '11:15' },
        { start: '11:20', end: '12:05' },
        { start: '12:05', end: '12:50' },
        { start: '12:50', end: '13:35' },
        { start: '13:40', end: '14:25' },
        { start: '14:30', end: '15:15' },
    ];

    for (const config of periodConfigs) {
        periods.push({
            start_time: config.start + ':00',
            end_time: config.end + ':00',
        });
    }
    const periodIds = await knex('periods').insert(periods).returning('id');

    console.log('Seeding sample schedules...');
    const schedules = [];

    // Note: Schedules require class_id, subject_id, day_id, period_id, and teacher_id
    // Since we don't have these yet, we'll skip creating schedules for now
    // They should be created after classes, subjects, and teachers are populated

    console.log(
        'Note: Schedules will be created after classes, subjects, and teachers are populated'
    );
    console.log(
        'Run the school management seed next to create complete schedules.'
    );

    console.log('\nAcademic infrastructure seeding completed successfully!');
    console.log(`Created ${academicYears.length} academic years`);
    console.log(`Created ${semesters.length} semesters`);
    console.log(`Created ${curriculums.length} curriculums`);
    console.log(`Created ${days.length} school days`);
    console.log(`Created ${periods.length} class periods`);

    console.log('\nNote: This seed focuses on academic infrastructure.');
    console.log(
        'Run the school management seed next to populate users, students, teachers, and classes.'
    );
};
