const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { periodValidator } = require('../validators/periodValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    periodValidator,
    authMiddleware,
    hasPermission('manage_days_periods'),
    periodController.createPeriod
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('get_periods'),
    periodController.getAllPeriods
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('get_periods'),
    periodController.getPeriod
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_days_periods'),
    periodController.updatePeriod
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_days_periods'),
    periodController.deletePeriod
);

module.exports = router;
