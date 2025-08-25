const { body } = require('express-validator');

exports.semesterValidator = [
  body('start_year').isDate().withMessage('invalid start year'),
  body('end_year').isDate().withMessage('invalid end year'),,

];