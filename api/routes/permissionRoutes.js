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
    hasPermission('create_permission'),
    permissionController.createPermission
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_permissions'),
    permissionController.getAllPermissions
);

module.exports = router;
