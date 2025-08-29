const { db } = require('../../config/db');

class Student {
    static async create(studentData, trx = null) {
        const query = db('students');
        if (trx) query.transacting(trx);
        return await query.insert(studentData).returning('*');
    }

    static async findById(id) {
        return await db('students').where({ id }).first();
    }

    static async findByUserId(user_id) {
        return await db('students').where({ user_id }).first();
    }

    static async getCurriculumId(grade_level) {
        return await db('curriculums')
            .where({ level_grade: grade_level, is_active: true })
            .first();
    }
    static async findByEmail(email, trx = null) {
        const user = await db('users').where({ email }).first();
        const query = db('students').where({ user_id: user.id }).first();
        if (trx) query.transacting(trx);
        return query;
    }
    static async findAll() {
        return await db('students as s')
            .join('users as u', 's.user_id', 'u.id')
            .join('classes as c', 's.class_id', 'c.id')
            .select(
                's.id',
                'u.name as student_name',
                'u.email',
                's.user_id',
                'u.phone',
                'u.birth_date',
                's.class_id',
                'c.class_name',
                's.grade_level'
            );
    }

    static async findByClassId(classId) {
        return await db('students as s')
            .join('users as u', 's.user_id', 'u.id')
            .where('s.class_id', classId)
            .select(
                's.id',
                'u.name as student_name',
                'u.email',
                'u.phone',
                'u.birth_date',
                's.class_id'
            );
    }

    static async update(id, studentData, userData) {
        const student = await db('students')
            .where({ id })
            .update(studentData)
            .returning('*');

        const user = await db('users')
            .where({ id: student[0].user_id })
            .update(userData)
            .returning('*');
        console.log(student, user);
        return { student, user };
    }

    static async delete(id) {
        return await db('students').where({ id }).del();
    }
    static async getClass(id) {
        return await db('students as s')
            .join('classes as c', 's.class_id', 'c.id')
            .where('s.id', id) // Changed from where({id:id}) to be more explicit
            .select('c.*');
    }
    static async getSubjects(id) {
        return await db('students as s')
            .join('subjects as su', 's.curriculum_id', 'su.curriculum_id')
            .where('s.id', id) // Changed from where({id:id}) to be more explicit
            .select('su.*');
    }
    static async getStudentArchive(id) {
        return await db('archives as a')
            .join('students as s', 's.id', 'a.student_id')
            .where('s.id', id) // Changed from where({id:id}) to be more explicit
            .select('a.*');
    }
    static async getStudentSchedule(id) {
        const scheduleEntries = await db('schedules as sc')
            .join('students as st', 'st.class_id', 'sc.class_id')
            .join('days as d', 'd.id', 'sc.day_id')
            .join('periods as p', 'p.id', 'sc.period_id')
            .leftJoin('subjects as su', 'su.id', 'sc.subject_id')
            .where('st.id', id)
            .select(
                'p.id as period_id',
                'p.start_time',
                'p.end_time',
                'd.id as day_id',
                'd.name as day_name',
                'su.name as subject_name'
            )
            .orderBy('d.id', 'asc') // Ensure days are ordered
            .orderBy('p.start_time', 'asc');

        console.log(scheduleEntries);

        // Group by day
        const scheduleByDay = {};
        scheduleEntries.forEach((entry) => {
            if (!scheduleByDay[entry.day_name]) {
                scheduleByDay[entry.day_name] = {
                    day_id: entry.day_id,
                    day_name: entry.day_name,
                    subjects: [],
                };
            }

            scheduleByDay[entry.day_name].subjects.push({
                period_id: entry.id,
                start_time: entry.start_time,
                end_time: entry.end_time,
                subject_name: entry.subject_name,
            });
        });

        // Convert to array format if preferred
        return Object.values(scheduleByDay);
    }
}

module.exports = Student;
