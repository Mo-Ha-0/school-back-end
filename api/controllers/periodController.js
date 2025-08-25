const periodService = require('../services/periodService');
const { validationResult } = require('express-validator');

module.exports = {
    async createPeriod(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Period = await periodService.createPeriod(req.body);
            res.status(201).json(Period);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getPeriod(req, res) {
        try {
            const period = await periodService.getPeriod(req.params.id);
            if (!period) return res.status(404).json({ error: 'Period not found' });
            res.json(period);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllPeriods(req, res) {
        try {
            const periods = await periodService.getAllPeriods();
            res.json(periods);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updatePeriod(req, res) {
        try {
            const period = await periodService.updatePeriod(req.params.id, req.body);
            if (!period) return res.status(404).json({ error: 'Period not found' });
            res.json(period);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deletePeriod(req, res) {
        try {
            const result = await periodService.deletePeriod(req.params.id);
            if (!result) return res.status(404).json({ error: 'Period not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};