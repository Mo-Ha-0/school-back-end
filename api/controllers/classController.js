const classService = require('../services/classService');
const { db } = require('../../config/db');
const { validationResult } = require('express-validator');

module.exports = {
    async createClass(req, res) {
        try {
            const classData = req.body;
            // Map frontend field names to database field names
            const dbData = {
                class_name: classData.class_name,
                floor_number: classData.floor_number,
                level_grade: classData.level_grade,
            };

            // Validate required fields first
            if (
                !dbData.class_name ||
                dbData.floor_number === undefined ||
                !dbData.level_grade
            ) {
                throw new Error(
                    'class_name, floor_number, and level_grade are required'
                );
            }

            return await db.transaction(async (trx) => {
                // 1. Create the class with validated data
                const [classId] = await trx('classes')
                    .insert(dbData)
                    .returning('id');

                // 2. Get all days and periods from database
                const days = await trx('days').select('id').orderBy('id');
                const periods = await trx('periods')
                    .select('id')
                    .orderBy('start_time');
                console.log(classId, days, periods);
                // 3. Generate schedule slots
                const scheduleSlots = days.flatMap((day) =>
                    periods.map((period) => ({
                        class_id: classId.id,
                        day_id: day.id,
                        period_id: period.id,
                        subject_id: null,
                    }))
                );

                // 4. Insert schedule slots
                await trx('schedules').insert(scheduleSlots);

                res.json({
                    success: true,
                    classId,
                    slotsCreated: scheduleSlots.length,
                });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getClass(req, res) {
        try {
            const Class = await classService.getClass(req.params.id);
            if (!Class)
                return res.status(404).json({ error: 'Class not found' });
            res.json(Class);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getClassesGroupedByGrade(req, res) {
        try {
            const Classes = await classService.getClassesGroupedByGrade();
            if (!Classes)
                return res.status(404).json({ error: 'Class not found' });
            res.json(Classes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllClasses(req, res) {
        try {
            const Class = await classService.getAllClasses();
            res.json(Class);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateClass(req, res) {
        try {
            // Use the new field names directly
            const dbData = {
                class_name: req.body.class_name,
                floor_number: req.body.floor_number,
                level_grade: req.body.level_grade,
            };

            const Class = await classService.updateClass(req.params.id, dbData);
            if (!Class || Class.length == 0)
                return res.status(404).json({ error: 'Class not found' });
            res.json(Class);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteClass(req, res) {
        try {
            const result = await classService.deleteClass(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Class not found' });
            res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error) {
            // Handle specific error for students in class
            if (
                error.message.includes(
                    'Cannot delete class: There are students assigned to this class'
                )
            ) {
                return res.status(400).json({
                    error: 'Cannot delete class: There are students assigned to this class. Please remove all students first.',
                });
            }
            res.status(500).json({ error: error.message });
        }
    },

    async canDeleteClass(req, res) {
        try {
            const result = await classService.canDeleteClass(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStudentsInClass(req, res) {
        try {
            const classExists = await classService.getClass(req.body.id);
            if (!classExists)
                return res.status(404).json({ error: 'Class not found' });
            const Students = await classService.getStudentsInClass(req.body.id);
            if (!Students)
                return res.status(404).json({ error: 'Students not found' });
            res.json(Students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getClassSchedule(req, res) {
        try {
            const classExists = await classService.getClass(req.body.id);
            if (!classExists)
                return res.status(404).json({ error: 'Class not found' });
            const schedules = await classService.getClassSchedule(req.body.id);
            if (!schedules)
                return res.status(404).json({ error: 'schedules not found' });
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getClassSubjectsWithTeachers(req, res) {
        try {
            const classId = req.params.id;
            const classExists = await classService.getClass(classId);
            if (!classExists)
                return res.status(404).json({ error: 'Class not found' });
            const data = await classService.getClassSubjectsWithTeachers(
                classId
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
