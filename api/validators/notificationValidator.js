const { body } = require('express-validator');

exports.notificationValidator = [
  body('title').isLength({ min: 3 }).withMessage('Invalid token'),
  body('body').isLength({ min: 3 }).withMessage('Invalid device_type'),
];