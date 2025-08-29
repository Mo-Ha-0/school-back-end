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
    hasPermission('create_role'),
    roleController.createRole
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_roles'),
    roleController.getAllRoles
);

router.get(
    '/employees',
    authMiddleware,
    hasPermission('get_roles'),
    roleController.getAllEmployeesRoles
);

router.put(
    '/update-role',
    authMiddleware,
    hasPermission('update_role'),
    roleController.updatePermissions
);

router.get(
    '/:roleId/permissions',
    authMiddleware,
    hasPermission('get_permissions'),
    roleController.getRolePermissions
);

router.put(
    '/:roleId',
    authMiddleware,
    hasPermission('update_role'),
    roleController.updateRoleName
);

router.delete(
    '/:roleId',
    authMiddleware,
    hasPermission('delete_role'),
    roleController.deleteRole
);

module.exports = router;
