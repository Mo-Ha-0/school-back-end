const { body } = require('express-validator');

exports.dayValidator = [
    body('name').isIn(['sunday','monday','tuesday','wedenesday','thursday']).withMessage("Invalid name"),
  
];

