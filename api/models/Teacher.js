const { db } = require('../../config/db');

class Teacher {
    static async create(teacherData, trx = null) {
        const query = db('teachers');
        if (trx) query.transacting(trx);
        return await query.insert(teacherData).returning('*');
    }

    static async attachSubjects(teacherId, subjectIds, trx = null) {
        if (!Array.isArray(subjectIds) || subjectIds.length === 0) return [];
        const rows = subjectIds.map((sid) => ({
            teacher_id: teacherId,
            subject_id: sid,
        }));
        const query = db('teachers_subjects');
        if (trx) query.transacting(trx);
        return await query.insert(rows).returning('*');
    }

    static async findById(id) {
        return await db('teachers').where({ id }).first();
    }

    static async findByIdDetailed(id) {
        const rows = await db('teachers as t')
            .join('users as u', 'u.id', 't.user_id')
            .leftJoin('teachers_subjects as ts', 'ts.teacher_id', 't.id')
            .leftJoin('subjects as s', 's.id', 'ts.subject_id')
            .where('t.id', id)
            .groupBy(
                't.id',
                't.user_id',
                't.specialization',
                't.hire_date',
                't.qualification',
                'u.id',
                'u.name',
                'u.email',
                'u.phone',
                'u.birth_date'
            )
            .select(
                't.id as id',
                't.user_id',
                't.specialization',
                't.hire_date',
                't.qualification',
                'u.name',
                'u.email',
                'u.phone',
                'u.birth_date'
            )
            .select(
                db.raw(
                    "COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.id IS NOT NULL), '[]') as subjects"
                )
            );

        return rows && rows.length > 0 ? rows[0] : null;
    }

    static async findByUserId(user_id) {
        return await db('teachers').where({ user_id }).first();
    }

    static async findAll() {
        return await db('teachers').select('*');
    }

    static async findAllDetailed() {
        return await db('teachers as t')
            .join('users as u', 'u.id', 't.user_id')
            .leftJoin('teachers_subjects as ts', 'ts.teacher_id', 't.id')
            .leftJoin('subjects as s', 's.id', 'ts.subject_id')
            .groupBy(
                't.id',
                't.user_id',
                't.specialization',
                't.hire_date',
                't.qualification',
                'u.id',
                'u.name',
                'u.email',
                'u.phone',
                'u.birth_date'
            )
            .select(
                't.id as id',
                't.user_id',
                't.specialization',
                't.hire_date',
                't.qualification',
                'u.name',
                'u.email',
                'u.phone',
                'u.birth_date'
            )
            .select(
                db.raw(
                    "COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.id IS NOT NULL), '[]') as subjects"
                )
            );
    }

    static async update(id, updates) {
        return await db('teachers')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('teachers').where({ id }).del();
    }
    static async clearSubjects(teacherId, trx = null) {
        const query = db('teachers_subjects').where('teacher_id', teacherId);
        if (trx) query.transacting(trx);
        return await query.del();
    }
    static async getSubjects(id) {
        return await db('subjects as su')
            .join('teachers_subjects as ts', 'ts.subject_id', 'su.id')
            .where('ts.teacher_id', id)
            .select('su.*');
    }
    static async getTeacherSchedule(id) {
        const scheduleEntries = await db('schedules as sc')
            .join('days as d', 'd.id', 'sc.day_id')
            .join('periods as p', 'p.id', 'sc.period_id')
            .join('subjects as su', 'su.id', 'sc.subject_id')
            .where('sc.teacher_id', id)
            .select('p.*', 'd.*', 'su.name as subject_name');
        const scheduleByDay = {};
        scheduleEntries.forEach((entry) => {
            if (!scheduleByDay[entry.name]) {
                scheduleByDay[entry.name] = {
                    day_id: entry.day_id,
                    name: entry.name,
                    subjects: [],
                };
            }

            scheduleByDay[entry.name].subjects.push({
                start_time: entry.start_time,
                end_time: entry.end_time,
                subject_name: entry.subject_name,
            });
        });

        // Convert to array format if preferred
        return Object.values(scheduleByDay);
    }

    static async getQuestions(id) {
        // First, get all subjects assigned to the teacher
        const teacherSubjects = await db('teachers as t')
            .join('teachers_subjects as ts', 'ts.teacher_id', 't.id')
            .join('subjects as s', 's.id', 'ts.subject_id')
            .where('ts.teacher_id', id)
            .select('s.id as subject_id', 's.name as subject_name');

        if (teacherSubjects.length === 0) {
            return [];
        }

        // Then get questions and options for those subjects (if they exist)
        const rows = await db('teachers as t')
            .join('teachers_subjects as ts', 'ts.teacher_id', 't.id')
            .join('subjects as s', 's.id', 'ts.subject_id')
            .leftJoin('questions as q', 'q.subject_id', 'ts.subject_id')
            .leftJoin('options as o', 'o.question_id', 'q.id')
            .where('ts.teacher_id', id)
            .select(
                's.id as subject_id',
                's.name as subject_name',
                'q.type',
                'o.id as option_id',
                'o.text as option_text',
                'o.is_correct',
                'q.id as question_id',
                'q.question_text'
            )
            .orderBy('s.id', 'q.id');

        // Initialize subjects map with all teacher subjects
        const subjectsMap = {};
        teacherSubjects.forEach((subject) => {
            subjectsMap[subject.subject_id] = {
                subject_id: subject.subject_id,
                subject_name: subject.subject_name,
                questions: [],
            };
        });

        // Process questions and options if they exist
        rows.forEach((row) => {
            if (row.question_id) {
                // Only process if question exists
                const subjectId = row.subject_id;
                const questionId = row.question_id;

                if (
                    !subjectsMap[subjectId].questions.find(
                        (q) => q.question_id === questionId
                    )
                ) {
                    // Add new question
                    subjectsMap[subjectId].questions.push({
                        question_id: row.question_id,
                        question_text: row.question_text,
                        type: row.type,
                        options: [],
                    });
                }

                // Find the question and add option
                const question = subjectsMap[subjectId].questions.find(
                    (q) => q.question_id === questionId
                );
                if (question && row.option_id) {
                    question.options.push({
                        option_id: row.option_id,
                        option_text: row.option_text,
                        is_correct: row.is_correct,
                    });
                }
            }
        });

        const result = Object.values(subjectsMap);
        return result;
    }
    static async getStudents(teacherId) {
        // Find all classes taught by this teacher via schedules, then return students in those classes
        const classIdsQuery = db('schedules as sc')
            .where('sc.teacher_id', teacherId)
            .distinct('sc.class_id');

        return await db('students as st')
            .join('users as u', 'u.id', 'st.user_id')
            .join('classes as c', 'c.id', 'st.class_id')
            .leftJoin('attendance_students as att', 'att.student_id', 'st.id')
            .whereIn('st.class_id', classIdsQuery)
            .select(
                'st.id',
                'st.user_id',
                'st.class_id',
                'st.grade_level',
                'u.name as student_name',
                'u.email',
                'u.phone',
                'u.birth_date',
                'c.class_name',
                'c.level_grade',
                db.raw(`
                    CASE 
                        WHEN COUNT(att.id) = 0 THEN 0
                        ELSE ROUND(
                            (COUNT(CASE WHEN att.status = 'present' THEN 1 END) * 100.0 / COUNT(att.id)), 2
                        )
                    END as attendance_percentage
                `)
            )
            .groupBy(
                'st.id',
                'st.user_id',
                'st.class_id',
                'st.grade_level',
                'u.name',
                'u.email',
                'u.phone',
                'u.birth_date',
                'c.class_name',
                'c.level_grade'
            );
    }
    static async getClassesByTeacher(teacherId) {
        try {
            const schedules = await db('schedules as sc')
                .join('classes as cl', 'sc.class_id', 'cl.id')
                .join('subjects as sub', 'sc.subject_id', 'sub.id')
                .join('periods as p', 'sc.period_id', 'p.id')
                .join('days as d', 'sc.day_id', 'd.id')
                .where('sc.teacher_id', teacherId)
                .select(
                    'sc.id as schedule_id',
                    'cl.id as class_id',
                    'cl.class_name',
                    'cl.level_grade',
                    'sub.id as subject_id',
                    'sub.name as subject_name',
                    'p.id as period_id',
                    'p.start_time',
                    'p.end_time',
                    'd.id as day_id',
                    'd.name as day_name'
                )
                .orderBy('d.id')
                .orderBy('p.start_time');

            const classesMap = new Map();

            schedules.forEach((schedule) => {
                if (!classesMap.has(schedule.class_id)) {
                    classesMap.set(schedule.class_id, {
                        class_id: schedule.class_id,
                        class_name: schedule.class_name,
                        level_grade: schedule.level_grade,
                        subjects: [],
                        schedule: [],
                    });
                }

                const classObj = classesMap.get(schedule.class_id);

                const subjectExists = classObj.subjects.some(
                    (sub) => sub.subject_id === schedule.subject_id
                );

                if (!subjectExists) {
                    classObj.subjects.push({
                        subject_id: schedule.subject_id,
                        subject_name: schedule.subject_name,
                    });
                }

                // Add schedule entry
                classObj.schedule.push({
                    day_name: schedule.day_name,
                    subject_name: schedule.subject_name,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                });
            });

            // Convert map to array
            return Array.from(classesMap.values());
        } catch (error) {
            console.error('Error in getClassesByTeacher:', error);
            throw error;
        }
    }
}

module.exports = Teacher;
