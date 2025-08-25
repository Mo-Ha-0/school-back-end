const behaviorService = require('../services/behaviorService');
const studentService = require('../services/studentService');
const { validationResult } = require('express-validator');
const { toDateOnly } = require('../utils/dateUtils');
const { stripSensitive } = require('../utils/sanitize');

module.exports = {
    async createBehavior(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { student_id, description, type } = req.body;
            const created_by = req.user.id;
            const date = new Date(); // Set date to current date

            const behavior = await behaviorService.createBehavior({
                student_id,
                description,
                date,
                type,
                created_by,
            });
            res.status(201).json(behavior);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getBehavior(req, res) {
        try {
            const behavior = await behaviorService.getBehavior(req.params.id);
            if (!behavior)
                return res.status(404).json({ error: 'Behavior not found' });

            res.json(behavior);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllBehaviors(req, res) {
        try {
            const behaviors = await behaviorService.getAllBehaviors();
            res.json(behaviors);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateBehavior(req, res) {
        try {
            const behavior = await behaviorService.updateBehavior(
                req.params.id,
                req.body
            );
            if (!behavior || behavior.length == 0)
                return res.status(404).json({ error: 'Behavior not found' });
            res.json(behavior);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteBehavior(req, res) {
        try {
            const result = await behaviorService.deleteBehavior(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Behavior not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getMyBehaviors(req, res) {
        try {
            const userId = req.user.id;
            const student = await studentService.findByUserId(userId);
            if (!student)
                return res.status(404).json({ error: 'Student not found' });
            const behaviors = await behaviorService.getBehaviorsByStudentId(
                student.id
            );
            const formatted = behaviors.map((behavior) => ({
                ...behavior,
                date: toDateOnly(behavior.date),
            }));
            res.json(stripSensitive(formatted));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
