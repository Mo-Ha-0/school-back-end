const { body } = require('express-validator');

exports.permissionValidator = [
body('name').isLength({min:3}).withMessage('invalid name')

];