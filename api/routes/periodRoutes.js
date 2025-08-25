const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
//const {checkRoles}=require('../../middleware/roleMiddleware');
//const authMiddleware=require('../../middleware/authMiddleware');
const { periodValidator } = require('../validators/periodValidator');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    periodValidator,
    authMiddleware,
    hasPermission('create_period'),
    periodController.createPeriod
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_periods'),
    periodController.getAllPeriods
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_periods'),
    periodController.getPeriod
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_period'),
    periodController.updatePeriod
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_period'),
    periodController.deletePeriod
);

module.exports = router;
