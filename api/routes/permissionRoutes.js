const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { permissionValidator } = require('../validators/permissionValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    permissionValidator,
    authMiddleware,
    hasPermission('manage_permissions'),
    permissionController.createPermission
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_roles'),
    permissionController.getAllPermissions
);

module.exports = router;
