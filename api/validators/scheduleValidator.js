const { body } = require('express-validator');

exports.scheduleValidator = [
    body('subject_id').isInt().withMessage("Invalid subject_id"),
    body('class_id').isInt({min:1}).withMessage('Invalid class_id'),
    body('day_id').isInt().withMessage("Invalid day_id"),
    body('period_id').isInt().withMessage("Invalid period_id"),
];

