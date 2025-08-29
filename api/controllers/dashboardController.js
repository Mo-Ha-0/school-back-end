const DashboardService = require('../services/dashboardService');
const {
    createErrorResponse,
    HTTP_STATUS,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    /**
     * Get basic dashboard statistics
     */
    async getDashboardStats(req, res) {
        try {
            const stats = await DashboardService.getDashboardStats();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: stats,
                message: 'Dashboard statistics retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get dashboard statistics', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve dashboard statistics.',
                    null,
                    'DASHBOARD_STATS_ERROR'
                )
            );
        }
    },

    /**
     * Get detailed dashboard statistics with growth percentages
     */
    async getDetailedDashboardStats(req, res) {
        try {
            const detailedStats = await DashboardService.getDetailedDashboardStats();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: detailedStats,
                message: 'Detailed dashboard statistics retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get detailed dashboard statistics', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve detailed dashboard statistics.',
                    null,
                    'DETAILED_DASHBOARD_STATS_ERROR'
                )
            );
        }
    },

    /**
     * Get individual statistics
     */
    async getTotalStudents(req, res) {
        try {
            const count = await DashboardService.getTotalStudents();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { totalStudents: count },
                message: 'Total students count retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get total students count', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve total students count.',
                    null,
                    'STUDENTS_COUNT_ERROR'
                )
            );
        }
    },

    async getActiveTeachers(req, res) {
        try {
            const count = await DashboardService.getActiveTeachers();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { activeTeachers: count },
                message: 'Active teachers count retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get active teachers count', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve active teachers count.',
                    null,
                    'TEACHERS_COUNT_ERROR'
                )
            );
        }
    },

    async getClassesToday(req, res) {
        try {
            const count = await DashboardService.getClassesToday();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { classesToday: count },
                message: 'Classes today count retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get classes today count', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve classes today count.',
                    null,
                    'CLASSES_TODAY_ERROR'
                )
            );
        }
    },

    async getAttendanceRate(req, res) {
        try {
            const rate = await DashboardService.getAttendanceRate();
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { attendanceRate: `${rate}%` },
                message: 'Attendance rate retrieved successfully'
            });
        } catch (error) {
            logError('Failed to get attendance rate', error, {
                userId: req.user?.id,
                path: req.originalUrl,
                method: req.method
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve attendance rate.',
                    null,
                    'ATTENDANCE_RATE_ERROR'
                )
            );
        }
    }
};
