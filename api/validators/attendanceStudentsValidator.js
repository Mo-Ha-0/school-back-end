const { body } = require('express-validator');

exports.attendanceStudentsValidator = [
  body('attendance').isArray().withMessage('Invalide attendance'),
 
];