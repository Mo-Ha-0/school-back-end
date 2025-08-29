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
    hasPermission('manage_days_periods'),
    dayController.createDay
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('get_days'),
    dayController.getAllDays
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('get_days'),
    dayController.getDay
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_days_periods'),
    dayController.updateDay
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_days_periods'),
    dayController.deleteDay
);

module.exports = router;
