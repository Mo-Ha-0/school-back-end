const archiveService = require('../services/archiveService');

const {  validationResult } = require('express-validator');

const bcrypt=require('bcrypt-nodejs');
module.exports = {

  async createArchive(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const Archive = await archiveService.createArchive(req.body);
      res.status(201).json(Archive);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getArchive(req, res) {
    try {
      const Archive = await archiveService.getArchive(req.params.id);
      if (!Archive) return res.status(404).json({ error: 'Archive not found' });
      res.json(Archive);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllArchives(req, res) {
    try {
      const Archive = await archiveService.getAllArchives();
      res.json(Archive);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateArchive(req, res) {
    try {
      const Archive = await archiveService.updateArchive(req.params.id, req.body);
      if (!Archive||Archive.length==0) return res.status(404).json({ error: 'Archive not found' });
      res.json(Archive);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteArchive(req, res) {
    try {
      const result = await archiveService.deleteArchive(req.params.id);
      if (!result) return res.status(404).json({ error: 'Archive not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

 
};