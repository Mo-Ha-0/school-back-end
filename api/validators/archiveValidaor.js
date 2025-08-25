const { body } = require('express-validator');

exports.archiveValidator = [
  body('student_id').isInt({min:1}).withMessage('Invalide student id '),
  body('academic_year_id').isInt({min:1}).withMessage('Invalide student id '),
  body('remaining_tuition').isInt({min:0}).withMessage('Invalide remianing tuition  '),
];