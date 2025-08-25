const { body } = require('express-validator');

exports.subjectValidator = [
    body('name').isString({ min: 3 }).withMessage('Invalid class_name'),
    // body('resources').isString({ min: 3 }).withMessage('Invalid resources'),
    // body('teacher_id').isInt({min:1}).withMessage('Invalid teacher_id'),
    body('level_grade')
        .isInt({ min: 9, max: 12 })
        .withMessage('level_grade must be one of [9, 10, 11, 12]'),
];
