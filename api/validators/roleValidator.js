const { body } = require('express-validator');
const { db } = require('../../config/db');

exports.roleValidator = [
  body('name')
    .isLength({ min: 3 })
    .withMessage('role name must be at least 3 characters long'),
  body('permissions').isArray().withMessage('Permissions must be an array'),
];
