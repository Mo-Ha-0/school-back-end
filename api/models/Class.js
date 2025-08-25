const { db } = require('../../config/db');

class Class {
    static async create(classData) {
        // Use the new field names directly
        const dbData = {
            class_name: classData.class_name,
            floor_number: classData.floor_number,
            level_grade: classData.level_grade,
        };

        return await db('classes')
            .insert(dbData)
            .returning(['id', 'class_name', 'floor_number', 'level_grade']);
    }

    static async findById(id) {
        return await db('classes')
            .where({ id })
            .select('id', 'class_name', 'floor_number', 'level_grade')
            .first();
    }

    static async findAll() {
        return await db('classes').select(
            'id',
            'class_name',
            'floor_number',
            'level_grade'
        );
    }

    static async getClassesGroupedByGrade() {
        const classes = await db('classes').select('*');

        const studentCounts = new Map();

        const classStudentCounts = await db('students')
            .select('class_id', db.raw('COUNT(*) as student_count'))
            .groupBy('class_id');

        classStudentCounts.forEach((row) => {
            studentCounts.set(row.class_id, row.student_count);
        });

        const grouped = classes.reduce((acc, classItem) => {
            const gradeKey = classItem.level_grade || 'Ungrouped';

            if (!acc[gradeKey]) {
                acc[gradeKey] = {
                    grade_level: gradeKey,
                    classes: [],
                };
            }

            acc[gradeKey].classes.push({
                id: classItem.id,
                class_name: classItem.class_name,
                floor_number: classItem.floor_number,
                capacity: studentCounts.get(classItem.id) || 0,
            });

            return acc;
        }, {});

        return Object.values(grouped);
    }

    static async update(id, updates) {
        // Use the new field names directly
        const dbUpdates = {
            class_name: updates.class_name,
            floor_number: updates.floor_number,
            level_grade: updates.level_grade,
        };

        return await db('classes')
            .where({ id })
            .update(dbUpdates)
            .returning(['id', 'class_name', 'floor_number', 'level_grade']);
    }

    static async canDelete(id) {
        try {
            // Check if the class exists
            const classExists = await db('classes').where({ id }).first();
            if (!classExists) {
                return { canDelete: false, reason: 'Class not found' };
            }

            // Check if there are any students in this class
            const studentsInClass = await db('students')
                .where({ class_id: id })
                .count('* as count')
                .first();

            if (parseInt(studentsInClass.count) > 0) {
                return {
                    canDelete: false,
                    reason: 'Cannot delete class: There are students assigned to this class. Please remove all students first.',
                    studentCount: parseInt(studentsInClass.count),
                };
            }

            // Count schedules for this class
            const scheduleCount = await db('schedules')
                .where({ class_id: id })
                .count('* as count')
                .first();

            return {
                canDelete: true,
                reason: 'Class can be deleted safely',
                scheduleCount: parseInt(scheduleCount.count),
            };
        } catch (error) {
            console.error(
                `Error checking if class ${id} can be deleted:`,
                error
            );
            return {
                canDelete: false,
                reason: 'Error checking deletion status',
            };
        }
    }

    static async delete(id) {
        return await db.transaction(async (trx) => {
            try {
                // First, check if the class exists
                const classExists = await trx('classes').where({ id }).first();
                if (!classExists) {
                    throw new Error('Class not found');
                }

                // Check if there are any students in this class
                const studentsInClass = await trx('students')
                    .where({ class_id: id })
                    .count('* as count')
                    .first();

                if (parseInt(studentsInClass.count) > 0) {
                    throw new Error(
                        'Cannot delete class: There are students assigned to this class. Please remove all students first.'
                    );
                }

                // Count schedules for this class (for logging)
                const scheduleCount = await trx('schedules')
                    .where({ class_id: id })
                    .count('* as count')
                    .first();

                console.log(
                    `Deleting class ${id} with ${scheduleCount.count} schedule entries`
                );

                // Delete all schedules for this class
                const deletedSchedules = await trx('schedules')
                    .where({ class_id: id })
                    .del();
                console.log(
                    `Deleted ${deletedSchedules} schedule entries for class ${id}`
                );

                // Now delete the class
                const deletedClass = await trx('classes').where({ id }).del();
                console.log(`Deleted class ${id}`);

                return deletedClass;
            } catch (error) {
                console.error(`Error deleting class ${id}:`, error);
                throw error;
            }
        });
    }

    static async getStudentsInClass(id) {
        return await db('classes as c')
            .join('students as s', 's.class_id', 'c.id')
            .join('users as u', 'u.id', 's.user_id')
            .leftJoin('attendance_students as att', 'att.student_id', 's.id')
            .where('c.id', id)
            .select(
                's.id',
                's.grade_level',
                's.class_id',
                'u.name as student_name',
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
                's.id',
                's.grade_level',
                's.class_id',
                'u.name',
                'c.class_name',
                'c.level_grade'
            );
    }

    static async getClassSchedule(id) {
        const scheduleEntries = await db('classes as c')
            .join('schedules as sc', 'sc.class_id', 'c.id')
            .join('days as d', 'd.id', 'sc.day_id')
            .join('periods as p', 'p.id', 'sc.period_id')
            .join('subjects as su', 'su.id', 'sc.subject_id')
            .where('c.id', id) // Changed from where({id:id}) to be more explicit
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

    static async getClassSubjectsWithTeachers(classId) {
        const cls = await db('classes').where({ id: classId }).first();
        if (!cls) return null;

        const subjects = await db('subjects as s')
            .join('curriculums as cu', 'cu.id', 's.curriculum_id')
            .where('cu.level_grade', cls.level_grade)
            .select('s.id as sub_id', 's.name as sub_name');

        const subjectIds = subjects.map((s) => s.sub_id);
        const teacherRows = subjectIds.length
            ? await db('teachers_subjects as ts')
                  .join('teachers as t', 't.id', 'ts.teacher_id')
                  .join('users as u', 'u.id', 't.user_id')
                  .whereIn('ts.subject_id', subjectIds)
                  .select(
                      'ts.subject_id as sub_id',
                      't.id as teacher_id',
                      'u.name as teacher_name'
                  )
            : [];

        const map = new Map();
        subjects.forEach((s) => {
            map.set(s.sub_id, {
                sub_id: s.sub_id,
                sub_name: s.sub_name,
                teachers: [],
            });
        });
        teacherRows.forEach((r) => {
            const entry = map.get(r.sub_id);
            if (entry) {
                entry.teachers.push({
                    teacher_id: r.teacher_id,
                    teacher_name: r.teacher_name,
                });
            }
        });

        return Array.from(map.values());
    }
}

module.exports = Class;
