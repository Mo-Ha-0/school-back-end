const { body } = require('express-validator');

exports.curriculumValidator = [
  body('level_grade').isInt({min:1}).withMessage('Invalid level_grade'),
  body('is_active').isBoolean().withMessage('Invalid is_active'),
  body('created_by').isInt({min:1}).withMessage('Invalid created_by'),
];