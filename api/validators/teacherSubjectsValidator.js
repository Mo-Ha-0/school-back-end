const { body } = require('express-validator');

exports.teacherSubjectsValidator = [
   body('teacher_id').isInt({min:1}).withMessage('invalid teacher_id'),
   body('subject_id').isInt({min:1}).withMessage('invalid subject_id'),
];

