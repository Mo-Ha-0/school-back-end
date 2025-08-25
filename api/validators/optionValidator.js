const { body } = require('express-validator');

exports.optionValidator = [
  body('text').isLength({min:3}).withMessage('Invalid text'),
 
  body('question_id').isInt({min:1}).withMessage('Invalid qustion_id'),
  body('is_correct').isBoolean().withMessage('Invalid is_correct')
];

