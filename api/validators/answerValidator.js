const { body } = require('express-validator');

exports.answerValidator = [
//  body('mark_awarded').isInt({min:0}).withMessage('Invalid mark_awarded'),
  body('question_id').isInt({min:1}).withMessage('Invalid qustion_id'),
  body('option_id').isInt({min:1}).withMessage('Invalid option_id'),

];

