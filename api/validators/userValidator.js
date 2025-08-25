const { body } = require('express-validator');
exports.UserValidator = [
    body('name')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 chars'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').isLength({ min: 10 }).withMessage('Invalid phone'),
    body('birth_date').isDate().withMessage('Invalid birth_date'),
    body('role_id').isInt({ min: 1 }).withMessage('Invalid role_id'),

    // body('password')
    //   .isLength({ min: 8 })
    //   .withMessage('Password must be at least 6 chars'),
];
