const gradeService = require('../services/gradeService');

const {  validationResult } = require('express-validator');

const bcrypt=require('bcrypt-nodejs');
module.exports = {

  async createGrade(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const Grade = await gradeService.createGrade(req.body);
      res.status(201).json(Grade);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getGrade(req, res) {
    try {
      const Grade = await gradeService.getGrade(req.params.id);
      if (!Grade) return res.status(404).json({ error: 'Grade not found' });
      res.json(Grade);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllGrades(req, res) {
    try {
      const Grade = await gradeService.getAllGradees();
      res.json(Grade);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateGrade(req, res) {
    try {
      const Grade = await gradeService.updateGrade(req.params.id, req.body);
      if (!Grade||Grade.length==0) return res.status(404).json({ error: 'Grade not found' });
      res.json(Grade);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteGrade(req, res) {
    try {
      const result = await gradeService.deleteGrade(req.params.id);
      if (!result) return res.status(404).json({ error: 'Grade not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};