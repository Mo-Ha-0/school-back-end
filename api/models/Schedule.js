const { db } = require('../../config/db');

class Schedule {
    static async create(scheduleData) {
        return await db('schedules').insert(scheduleData).returning('*');
    }

    static async findById(id) {
        return await db('schedules').where({ id }).first();
    }

    static async findAll() {
        return await db('schedules').select('*');
    }

    static async update(id, updates) {
        return await db('schedules')
            .where({ id })
            .update(updates)
            .returning('*');
    }

    static async delete(id) {
        return await db('schedules').where({ id }).del();
    }

    static async findByClassId(classId) {
        return await db('schedules as s')
            .join('days as d', 's.day_id', 'd.id')
            .join('periods as p', 's.period_id', 'p.id')
            .join('subjects as sub', 's.subject_id', 'sub.id')
            .join('teachers as t', 's.teacher_id', 't.id')
            .join('users as u', 't.user_id', 'u.id')
            .where('s.class_id', classId)
            .select(
                's.id',
                's.class_id',
                's.day_id',
                's.period_id',
                's.subject_id',
                's.teacher_id',
                'd.name as day_name',
                'p.start_time',
                'p.end_time',
                'sub.name as subject_name',
                'u.name as teacher_name'
            )
            .orderBy('d.id', 'asc')
            .orderBy('p.start_time', 'asc');
    }
}

module.exports = Schedule;
