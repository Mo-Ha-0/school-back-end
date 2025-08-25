const { body } = require('express-validator');

exports.examAttemptValidator = [

  body('exam_id').isInt({min:1}).withMessage('Invalid exam_id'),
  body('student_id').isInt({min:1}).withMessage('Invalid student_id'),

];

