const { body } = require('express-validator');

exports.academicYearValidator = [
    body('start_year').isDate().withMessage('invalid start year'),
    body('end_year').isDate().withMessage('invalid end year'),
    body('full_tuition')
        .exists()
        .withMessage('full_tuition is required')
        .isFloat({ min: 0 })
        .withMessage('full_tuition must be a non-negative number'),
];
