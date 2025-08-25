const { body } = require('express-validator');

exports.studentValidator = [
    body('name')
        .isLength({ min: 3 })
        .withMessage('name must be at least 3 chars'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').isLength({ min: 10 }).withMessage('Invalid phone'),
    body('birth_date').isDate().withMessage('Invalid birth_date'),
    body('grade_level')
        .isIn([9, 10, 11, 12])
        .withMessage('Invalid grade_level'),
    body('discount_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Invalid discount_percentage'),
    // body('password').isLength({ min:8 }).withMessage('Password must be at least 6 chars'),
    body('class_id').isInt({ min: 1 }).withMessage('Invalid class_id'),
    // body('curriculum_id').isInt().withMessage('Invalid curriculum_id'),
];
