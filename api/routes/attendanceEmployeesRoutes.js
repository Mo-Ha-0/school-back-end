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
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.createAttendanceEmployees
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.getAllAttendanceEmployees
);

router.get(
    '/employee/:employeeId',
    authMiddleware,
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.getAttendanceByEmployeeId
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.getAttendanceEmployees
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.updateAttendanceEmployees
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_employee_attendance'),
    attendanceEmployeesController.deleteAttendanceEmployees
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
