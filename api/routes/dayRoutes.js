const express = require('express');
const router = express.Router();
const dayController = require('../controllers/dayController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { dayValidator } = require('../validators/dayValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    dayValidator,
    authMiddleware,
    hasPermission('manage_schedules'),
    dayController.createDay
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_schedules'),
    dayController.getAllDays
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    dayController.getDay
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    dayController.updateDay
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    dayController.deleteDay
);

module.exports = router;
