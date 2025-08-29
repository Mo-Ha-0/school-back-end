const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');
const { roleValidator } = require('../validators/roleValidator');

router.post(
    '/',
    roleValidator,
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.createRole
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.getAllRoles
);

router.get(
    '/employees',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.getAllEmployeesRoles
);

router.put(
    '/update-role',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.updatePermissions
);

router.get(
    '/:roleId/permissions',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.getRolePermissions
);

router.put(
    '/:roleId',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.updateRoleName
);

router.delete(
    '/:roleId',
    authMiddleware,
    hasPermission('manage_roles'),
    roleController.deleteRole
);

module.exports = router;
