const answerService = require('../services/answerService');
const { validationResult } = require('express-validator');

module.exports = {
    async createAnswer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Answer = await answerService.createAnswer(req.body);
            res.status(201).json(Answer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getAnswer(req, res) {
        try {
            const Answer = await answerService.getAnswer(req.params.id);
            if (!Answer) return res.status(404).json({ error: 'Answer not found' });
            res.json(Answer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllAnswers(req, res) {
        try {
            const Answers = await answerService.getAllAnswers();
            res.json(Answers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateAnswer(req, res) {
        try {
            const Answer = await answerService.updateAnswer(req.params.id, req.body);
            if (!Answer||Answer.length==0) return res.status(404).json({ error: 'Answer not found' });
            res.json(Answer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteAnswer(req, res) {
        try {
            const result = await answerService.deleteAnswer(req.params.id);
            if (!result) return res.status(404).json({ error: 'Answer not found' });
            res.status(200).json({message:'deleted successfuly'});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};