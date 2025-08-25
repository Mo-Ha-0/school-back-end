const { body } = require('express-validator');

exports.periodValidator = [
    // body('start_time').isTime({hourFormat:'hour24',mode:'default'}).withMessage('Invalid start_time'),
    // body('end_time').isTime({hourFormat:'hour24',mode:'default'}).withMessage('Invalid end_time'),
];

