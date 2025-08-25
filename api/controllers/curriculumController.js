const curriculumService = require('../services/curriculumService');

const {  validationResult } = require('express-validator');

const bcrypt=require('bcrypt-nodejs');
module.exports = {

  async createCurriculum(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const Curriculum = await curriculumService.createCurriculum(req.body);
      res.status(201).json(Curriculum);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCurriculum(req, res) {
    try {
      const Curriculum = await curriculumService.getCurriculum(req.params.id);
      if (!Curriculum) return res.status(404).json({ error: 'Curriculum not found' });
      res.json(Curriculum);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllCurriculums(req, res) {
    try {
      const Curriculum = await curriculumService.getAllCurriculumes();
      res.json(Curriculum);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCurriculum(req, res) {
    try {
      const Curriculum = await curriculumService.updateCurriculum(req.params.id, req.body);
      if (!Curriculum||Curriculum.length==0) return res.status(404).json({ error: 'Curriculum not found' });
      res.json(Curriculum);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCurriculum(req, res) {
    try {
      const result = await curriculumService.deleteCurriculum(req.params.id);
      if (!result) return res.status(404).json({ error: 'Curriculum not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};