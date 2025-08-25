const { body } = require('express-validator');

exports.questionValidator = [
  body('question_text').isLength({min:3}).withMessage('Invalid question_text'),
  body('type').isIn(['mcq','true_false']).withMessage('invalid type'),

  body('subject_id').isInt({min:1}).withMessage('Invalid subject_id'),
];

