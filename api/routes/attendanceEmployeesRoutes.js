const express = require('express');
const router = express.Router();
const attendanceEmployeesController = require('../controllers/attendanceEmployeesController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    attendanceEmployeesValidator,
} = require('../validators/attendanceEmployeesValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    attendanceEmployeesValidator,
    authMiddleware,
    hasPermission('create_employees_attendance'),
    attendanceEmployeesController.createAttendanceEmployees
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_employees_attendance'),
    attendanceEmployeesController.getAllAttendanceEmployees
);

router.get(
    '/employee/:employeeId',
    authMiddleware,
    hasPermission('get_employees_attendance'),
    attendanceEmployeesController.getAttendanceByEmployeeId
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_employees_attendance'),
    attendanceEmployeesController.getAttendanceEmployees
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_employees_attendance'),
    attendanceEmployeesController.updateAttendanceEmployees
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_employees_attendance'),
    attendanceEmployeesController.deleteAttendanceEmployees
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
