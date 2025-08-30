const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { scheduleValidator } = require('../validators/scheduleValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    scheduleValidator,
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.createSchedule
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.getAllSchedules
);

router.get(
    '/class/:classId',
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.getSchedulesByClass
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.getSchedule
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.updateSchedule
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    scheduleController.deleteSchedule
);

module.exports = router;
