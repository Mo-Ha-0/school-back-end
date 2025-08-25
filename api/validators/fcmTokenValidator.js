const { body } = require('express-validator');

exports.fcmTokenValidator = [
  body('token').isLength({ min: 3 }).withMessage('Invalid token'),
  body('device_type').isLength({ min: 3 }).withMessage('Invalid device_type'),
];