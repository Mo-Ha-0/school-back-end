const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createNotification(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const { title, body } = req.body;
            const Notification = await notificationService.createNotification({
                user_id: req.user.id,
                title,
                body,
                sent_at: new Date(),
            });
            res.status(HTTP_STATUS.CREATED).json(Notification);
        } catch (error) {
            logError('Create notification failed', error, {
                title: req.body.title,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create notification.',
                    null,
                    'CREATE_NOTIFICATION_ERROR'
                )
            );
        }
    },

    async getNotification(req, res) {
        try {
            const Notification = await notificationService.getNotification(
                req.params.id
            );
            if (!Notification) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Notification not found',
                            null,
                            'NOTIFICATION_NOT_FOUND'
                        )
                    );
            }
            res.json(Notification);
        } catch (error) {
            logError('Get notification failed', error, {
                notificationId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve notification.',
                    null,
                    'GET_NOTIFICATION_ERROR'
                )
            );
        }
    },

    async getNotificationsForUser(req, res) {
        try {
            const Notifications =
                await notificationService.getNotificationsForUser(req.user.id);
            if (!Notifications) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Notifications not found for user',
                            null,
                            'USER_NOTIFICATIONS_NOT_FOUND'
                        )
                    );
            }
            res.json(Notifications);
        } catch (error) {
            logError('Get notifications for user failed', error, {
                userId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve notifications for user.',
                    null,
                    'GET_USER_NOTIFICATIONS_ERROR'
                )
            );
        }
    },

    async getAllNotificationes(req, res) {
        try {
            const Notification =
                await notificationService.getAllNotifications();
            res.json(Notification);
        } catch (error) {
            logError('Get all notifications failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve notifications.',
                    null,
                    'GET_NOTIFICATIONS_ERROR'
                )
            );
        }
    },

    async updateNotification(req, res) {
        try {
            const Notification = await notificationService.updateNotification(
                req.params.id,
                req.body
            );
            if (!Notification || Notification.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Notification not found',
                            null,
                            'NOTIFICATION_NOT_FOUND'
                        )
                    );
            }
            res.json(Notification);
        } catch (error) {
            logError('Update notification failed', error, {
                notificationId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update notification.',
                    null,
                    'UPDATE_NOTIFICATION_ERROR'
                )
            );
        }
    },

    async updateNotificationIsRead(req, res) {
        try {
            const Notification =
                await notificationService.updateNotificationIsRead(
                    req.params.id,
                    req.user.id
                );
            if (!Notification || Notification.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Notification not found',
                            null,
                            'NOTIFICATION_NOT_FOUND'
                        )
                    );
            }
            res.json(Notification);
        } catch (error) {
            logError('Update notification read status failed', error, {
                notificationId: req.params.id,
                userId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update notification read status.',
                    null,
                    'UPDATE_NOTIFICATION_READ_ERROR'
                )
            );
        }
    },

    async deleteNotification(req, res) {
        try {
            const result = await notificationService.deleteNotification(
                req.params.id
            );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Notification not found',
                            null,
                            'NOTIFICATION_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Notification deleted successfully',
            });
        } catch (error) {
            logError('Delete notification failed', error, {
                notificationId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete notification.',
                    null,
                    'DELETE_NOTIFICATION_ERROR'
                )
            );
        }
    },
};
