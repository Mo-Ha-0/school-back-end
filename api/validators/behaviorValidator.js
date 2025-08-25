const { body } = require('express-validator');

exports.behaviorValidator = [
    body('student_id').isInt({ min: 1 }).withMessage('Invalid student_id'),
    body('description').isLength({ min: 1 }).withMessage('Invalid description'),
    body('type')
        .isIn([
            'Exam Issues',
            'Attendance Problems',
            'Academic Integrity',
            'Behavior Concerns',
            'Social Skills',
            'Work Habits',
            'Practical Skills',
            'Good Behavior',
        ])
        .withMessage('Invalid type'),
];
