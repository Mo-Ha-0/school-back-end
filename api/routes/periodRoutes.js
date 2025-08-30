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
    hasPermission('manage_schedules'),
    periodController.createPeriod
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_schedules'),
    periodController.getAllPeriods
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    periodController.getPeriod
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    periodController.updatePeriod
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    periodController.deletePeriod
);

module.exports = router;
