const { body } = require('express-validator');

exports.examCorrectValidator = [

  body('exam_id').isInt({min:1}).withMessage('Invalid exam_id'),
  body('email').isEmail().withMessage('Invalid email'),
  body('answers').isArray().withMessage('Invalid answers')

];

