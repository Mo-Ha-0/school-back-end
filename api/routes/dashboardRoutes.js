const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');

// Get all dashboard statistics (detailed with growth percentages)
router.get(
    '/stats',
    authMiddleware,
    hasPermission('get_users'),
    dashboardController.getDetailedDashboardStats
);

// Get basic dashboard statistics
router.get(
    '/stats/basic',
    authMiddleware,
    hasPermission('get_users'),
    dashboardController.getDashboardStats
);

// Individual statistics endpoints
router.get(
    '/stats/students',
    authMiddleware,
    hasPermission('get_students'),
    dashboardController.getTotalStudents
);

router.get(
    '/stats/teachers',
    authMiddleware,
    hasPermission('get_teachers'),
    dashboardController.getActiveTeachers
);

router.get(
    '/stats/classes-today',
    authMiddleware,
    hasPermission('get_schedules'),
    dashboardController.getClassesToday
);

router.get(
    '/stats/attendance-rate',
    authMiddleware,
    hasPermission('get_students_attendance'),
    dashboardController.getAttendanceRate
);

module.exports = router;
