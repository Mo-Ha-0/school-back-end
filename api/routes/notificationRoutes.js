const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    notificationValidator,
} = require('../validators/notificationValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    notificationValidator,
    authMiddleware,
    hasPermission('create_notification'),
    notificationController.createNotification
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_notifications'),
    notificationController.getNotificationsForUser
);
router.get(
    '/all',
    authMiddleware,
    hasPermission('get_notifications'),
    notificationController.getAllNotificationes
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_notifications'),
    notificationController.getNotification
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_notification'),
    notificationController.updateNotification
);
router.put(
    '/:id/read',
    authMiddleware,
    hasPermission('update_notification'),
    notificationController.updateNotificationIsRead
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_notification'),
    notificationController.deleteNotification
);

module.exports = router;
