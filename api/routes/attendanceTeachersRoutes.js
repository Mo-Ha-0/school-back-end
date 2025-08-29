const express = require('express');
const router = express.Router();
const attendanceTeachersController = require('../controllers/attendanceTeachersController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    attendanceTeachersValidator,
} = require('../validators/attendanceTeachersValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    attendanceTeachersValidator,
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.createAttendanceTeachers
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.getAllAttendanceTeachers
);
router.get(
    '/teacher/:teacherId',
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.getAttendanceByTeacherId
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.getAttendanceTeachers
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.updateAttendanceTeachers
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_teacher_attendance'),
    attendanceTeachersController.deleteAttendanceTeachers
);

module.exports = router;
