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
    hasPermission('create_students_attendance'),
    attendanceStudentsController.createAttendanceStudents
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_students_attendance'),
    attendanceStudentsController.getAllAttendanceStudents
);

router.get(
    '/student/:studentId',
    authMiddleware,
    hasPermission('get_students_attendance'),
    attendanceStudentsController.getAttendanceByStudentId
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_students_attendance'),
    attendanceStudentsController.getAttendanceStudents
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_students_attendance'),
    attendanceStudentsController.updateAttendanceStudents
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_students_attendance'),
    attendanceStudentsController.deleteAttendanceStudents
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
