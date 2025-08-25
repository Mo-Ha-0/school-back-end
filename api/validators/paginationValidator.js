const { body } = require('express-validator');

const paginationValidator = [
    body('table')
        .isIn(['students', 'teachers', 'users'])
        .withMessage('Table must be either "students", "teachers", or "users"'),

    body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    body('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Page size must be between 1 and 100'),

    body('orderBy')
        .optional()
        .isString()
        .withMessage('Order by must be a string'),

    body('orderDirection')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order direction must be either "asc" or "desc"'),
];

module.exports = {
    paginationValidator,
};
