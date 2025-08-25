const permissionService = require('../services/permissionService');
const { validationResult } = require('express-validator');

module.exports = {
    async createPermission(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const Permission = await permissionService.createPermission(req.body);
            res.status(201).json(Permission);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    
    async getAllPermissions(req, res) {
        try {
            const Permissions = await permissionService.getAllPermissions();
            res.json(Permissions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

  
};