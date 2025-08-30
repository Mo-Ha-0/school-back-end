const express = require('express');
const router = express.Router();
const attendanceStudentsController = require('../controllers/attendanceStudentsController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    attendanceStudentsValidator,
} = require('../validators/attendanceStudentsValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    attendanceStudentsValidator,
    authMiddleware,
    hasPermission('manage_student_attendance', 'attendance_mobile_app'),
    attendanceStudentsController.createAttendanceStudents
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_student_attendance', 'attendance_mobile_app'),
    attendanceStudentsController.getAllAttendanceStudents
);
router.get(
    '/student/:studentId',
    authMiddleware,
    hasPermission('manage_student_attendance'),
    attendanceStudentsController.getAttendanceByStudentId
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_student_attendance'),
    attendanceStudentsController.getAttendanceStudents
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_student_attendance'),
    attendanceStudentsController.updateAttendanceStudents
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_student_attendance'),
    attendanceStudentsController.deleteAttendanceStudents
);

module.exports = router;
