const optionService = require('../services/optionService');
const { validationResult } = require('express-validator');

module.exports = {
    async createOption(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Option = await optionService.createOption(req.body);
            res.status(201).json(Option);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getOption(req, res) {
        try {
            const Option = await optionService.getOption(req.params.id);
            if (!Option) return res.status(404).json({ error: 'Option not found' });
            res.json(Option);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllOptions(req, res) {
        try {
            const Options = await optionService.getAllOptions();
            res.json(Options);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateOption(req, res) {
        try {
            const Option = await optionService.updateOption(req.params.id, req.body);
            if (!Option||Option.length==0) return res.status(404).json({ error: 'Option not found' });
            res.json(Option);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteOption(req, res) {
        try {
            const result = await optionService.deleteOption(req.params.id);
            if (!result) return res.status(404).json({ error: 'Option not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};