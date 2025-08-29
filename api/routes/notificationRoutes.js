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
    hasPermission('manage_notifications'),
    notificationController.createNotification
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('get_notifications'),
    notificationController.getNotificationsForUser
);

router.get(
    '/all',
    authMiddleware,
    hasPermission('manage_notifications'),
    notificationController.getAllNotificationes
);

router.put(
    '/:id/read',
    authMiddleware,
    // hasPermission('manage_notifications'),
    notificationController.updateNotificationIsRead
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('manage_notifications'),
    notificationController.getNotification
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_notifications'),
    notificationController.updateNotification
);

router.delete(
    '/:id',
    authMiddleware,
    // hasPermission('manage_notifications'),
    notificationController.deleteNotification
);

module.exports = router;
