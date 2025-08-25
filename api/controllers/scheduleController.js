const scheduleService = require('../services/scheduleService');
const { validationResult } = require('express-validator');
const studentService = require('../services/studentService');
const { db } = require('../../config/db');

module.exports = {
    async createSchedule(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Schedule = await scheduleService.createSchedule(req.body);
            res.status(201).json(Schedule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getSchedule(req, res) {
        try {
            const schedule = await scheduleService.getSchedule(req.params.id);
            if (!schedule)
                return res.status(404).json({ error: 'Schedule not found' });
            res.json(schedule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSchedules(req, res) {
        try {
            const schedules = await scheduleService.getAllSchedules();
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateSchedule(req, res) {
        try {
            const schedule = await scheduleService.updateSchedule(
                req.params.id,
                req.body
            );
            if (!schedule)
                return res.status(404).json({ error: 'Schedule not found' });
            res.json(schedule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteSchedule(req, res) {
        try {
            const result = await scheduleService.deleteSchedule(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Schedule not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSchedulesByClass(req, res) {
        try {
            const { classId } = req.params;
            const schedules = await scheduleService.getSchedulesByClass(
                classId
            );
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
