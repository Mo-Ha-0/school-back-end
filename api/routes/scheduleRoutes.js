const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
//const {checkRoles}=require('../../middleware/roleMiddleware');
//const authMiddleware=require('../../middleware/authMiddleware');

const { scheduleValidator } = require('../validators/scheduleValidator');
const hasPermission = require('../../middleware/hasPermission');
const authMiddleware = require('../../middleware/authMiddleware');

router.post(
    '/',
    scheduleValidator,
    authMiddleware,
    hasPermission('create_schedule'),
    scheduleController.createSchedule
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_schedules'),
    scheduleController.getAllSchedules
);

router.get(
    '/class/:classId',
    authMiddleware,
    hasPermission('get_schedules'),
    scheduleController.getSchedulesByClass
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_schedules'),
    scheduleController.getSchedule
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_schedule'),
    scheduleController.updateSchedule
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_schedule'),
    scheduleController.deleteSchedule
);

module.exports = router;
