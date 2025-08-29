const express = require('express');
const router = express.Router();
const fcmTokenController = require('../controllers/fcmTokenController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { fcmTokenValidator } = require('../validators/fcmTokenValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/register',
    fcmTokenValidator,
    authMiddleware,
    // hasPermission('create_fcm_token'),
    fcmTokenController.createFcmToken
);
router.get(
    '/sendMessage',
    authMiddleware,
    // hasPermission('send_message'),
    fcmTokenController.sendMessage
);
router.get(
    '/',
    authMiddleware,
    // hasPermission('get_fcm_tokens'),
    fcmTokenController.getAllFcmTokenes
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_fcm_tokens'),
    fcmTokenController.getFcmToken
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_fcm_token'),
    fcmTokenController.updateFcmToken
);
router.delete(
    '/:id',
    authMiddleware,
    // hasPermission('delete_fcm_token'),
    fcmTokenController.deleteFcmToken
);

module.exports = router;
