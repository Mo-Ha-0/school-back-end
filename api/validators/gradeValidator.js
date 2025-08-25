const { body } = require('express-validator');

exports.gradeValidator = [
  body('archive_id').isInt({min:1}).withMessage('Invalid archive_id'),
  body('subject_id').isInt({min:1}).withMessage('Invalid subject_id'),
  body('semester_id').isInt({min:1}).withMessage('Invalid semester_id'),
  body('min_score').isInt({min:1}).withMessage('Invalid min_score'),
  body('max_score').isInt({min:1}).withMessage('Invalid max_score'),
  body('grade').isInt({min:1}).withMessage('Invalid grade'),
  body('type').isLength({ min: 1 }).withMessage('Invalid type'),
 
];