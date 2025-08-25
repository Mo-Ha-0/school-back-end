const { body } = require('express-validator');

exports.classValidator = [
    body('class_name').isString().withMessage('Invalid class_name'),
    body('floor_number').isInt({ min: 1 }).withMessage('Invalid floor_number'),
    body('level_grade')
        .isIn(['9', '10', '11', '12'])
        .withMessage('Invalid level_grade'),
];
