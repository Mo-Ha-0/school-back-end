const dayService = require('../services/dayService');
const { validationResult } = require('express-validator');

module.exports = {
    async createDay(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Day = await dayService.createDay(req.body);
            res.status(201).json(Day);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getDay(req, res) {
        try {
            const day = await dayService.getDay(req.params.id);
            if (!day) return res.status(404).json({ error: 'Day not found' });
            res.json(day);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllDays(req, res) {
        try {
            const days = await dayService.getAllDays();
            res.json(days);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateDay(req, res) {
        try {
            const day = await dayService.updateDay(req.params.id, req.body);
            if (!day) return res.status(404).json({ error: 'Day not found' });
            res.json(day);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteDay(req, res) {
        try {
            const result = await dayService.deleteDay(req.params.id);
            if (!result) return res.status(404).json({ error: 'Day not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};