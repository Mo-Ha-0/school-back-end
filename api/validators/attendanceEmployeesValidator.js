const { body } = require('express-validator');

exports.attendanceEmployeesValidator = [
  body('attendance').isArray().withMessage('Invalide attendance'),
 
];