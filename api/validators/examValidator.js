const { body } = require('express-validator');

exports.examValidator = [
  body('description').isLength({min:3}).withMessage('Invalid description'),
  body('title').isLength({min:3}).withMessage('Invalid title'),
  body('time_limit').isInt({min:30}).withMessage('Invalid time_limit'),
  body('total_mark').isInt({min:0}).withMessage('Invalid total_mark'),
  body('passing_mark').isInt({min:0}).withMessage('Invalid passing_mark'),
  body('subject_id').isInt({min:1}).withMessage('Invalid subject_id'),
  body('start_datetime').isLength({min:3}).withMessage('Invalid start_datetime'),
  body('end_datetime').isLength({min:3}).withMessage('Invalid end_date_time'),
  body('announced').optional().isBoolean().withMessage('Invalid announced value'),
  body('exam_type').optional().isIn(['exam','quiz']).withMessage('Invalid exam_type'),
];

