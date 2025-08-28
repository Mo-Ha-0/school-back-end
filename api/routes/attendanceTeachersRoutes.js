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
    hasPermission('create_teachers_attendance'),
    attendanceTeachersController.createAttendanceTeachers
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_teachers_attendance'),
    attendanceTeachersController.getAllAttendanceTeachers
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_teachers_attendance'),
    attendanceTeachersController.getAttendanceTeachers
);
router.get(
    '/teacher/:teacherId',
    authMiddleware,
    hasPermission('get_teachers_attendance'),
    attendanceTeachersController.getAttendanceByTeacherId
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_teachers_attendance'),
    attendanceTeachersController.updateAttendanceTeachers
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_teachers_attendance'),
    attendanceTeachersController.deleteAttendanceTeachers
);

module.exports = router;
