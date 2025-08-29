const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');

// Get all dashboard statistics (detailed with growth percentages)
router.get(
    '/stats',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getDetailedDashboardStats
);

// Get basic dashboard statistics
router.get(
    '/stats/basic',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getDashboardStats
);

// Individual statistics endpoints
router.get(
    '/stats/students',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getTotalStudents
);

router.get(
    '/stats/teachers',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getActiveTeachers
);

router.get(
    '/stats/classes-today',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getClassesToday
);

router.get(
    '/stats/attendance-rate',
    authMiddleware,
    hasPermission('view_dashboard'),
    dashboardController.getAttendanceRate
);

module.exports = router;
