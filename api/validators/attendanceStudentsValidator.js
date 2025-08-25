const { body } = require('express-validator');

exports.attendanceStudentsValidator = [
    body('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO date format'),
    body('attendance').isArray().withMessage('Attendance must be an array'),
    body('attendance.*.student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
    body('attendance.*.status')
        .isIn(['present', 'absent', 'late'])
        .withMessage('Status must be present, absent, or late'),
];
