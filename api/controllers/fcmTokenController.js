const fcmTokensService = require('../services/fcmTokensService');
const userService = require('../services/userService.js');
const roleService = require('../services/roleService.js');
const notificationService = require('../services/notificationService.js');
const { validationResult } = require('express-validator');
const admin = require('../../firebase/firebase-admin.js');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createFcmToken(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const { token, device_type } = req.body;
            const FcmToken = await fcmTokensService.createFcmToken({
                user_id: req.user.id,
                token,
                device_type,
                created_at: new Date(),
            });
            res.status(HTTP_STATUS.CREATED).json(FcmToken);
        } catch (error) {
            logError('Create FCM token failed', error, {
                device_type: req.body.device_type,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create FCM token.',
                    null,
                    'CREATE_FCM_TOKEN_ERROR'
                )
            );
        }
    },

    async sendMessage(req, res) {
        try {
            const { user_id, title, body } = req.body;
            const user = await userService.getUser(user_id);

            const role = await roleService.getRoleById(user.role_id);

            if (role[0].name !== 'student') {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'User is not a student',
                            null,
                            'USER_NOT_STUDENT'
                        )
                    );
            }

            const FcmTokens = await fcmTokensService.getTokensForUser(user_id);
            if (!FcmTokens || FcmTokens.length === 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'FCM tokens not found',
                            null,
                            'FCM_TOKENS_NOT_FOUND'
                        )
                    );
            }

            // Extract token strings from objects (if needed)
            const tokenStrings = FcmTokens.map((token) =>
                typeof token === 'string' ? token : token.token
            );

            // Filter out any null/undefined tokens
            const validTokens = tokenStrings.filter(
                (token) =>
                    token && typeof token === 'string' && token.length > 0
            );

            if (validTokens.length === 0) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'No valid FCM tokens found',
                            null,
                            'NO_VALID_FCM_TOKENS'
                        )
                    );
            }

            const message = {
                notification: { title, body },
                data: { user_id: user_id.toString() }, // Ensure string value
                tokens: validTokens,
            };

            console.log('Sending to tokens:', validTokens);

            const response = await admin
                .messaging()
                .sendEachForMulticast(message);
            console.log(response);
            // Handle response errors
            response.responses.forEach((resp, index) => {
                if (!resp.success) {
                    console.error(
                        `Failed to send to token ${validTokens[index]}:`,
                        resp.error?.code,
                        resp.error?.message
                    );

                    // Remove invalid tokens from database
                    if (
                        resp.error?.code ===
                            'messaging/invalid-registration-token' ||
                        resp.error?.code ===
                            'messaging/registration-token-not-registered'
                    ) {
                        fcmTokensService.removeToken(validTokens[index]);
                    }
                }
            });

            // Create notification only if at least one message was successful
            if (response.successCount > 0) {
                const notification =
                    await notificationService.createNotification({
                        user_id: user_id,
                        title,
                        body,
                        sent_at: new Date(),
                    });
                console.log('Notification created:', notification);
            }

            res.json({
                message: 'Process completed',
                successCount: response.successCount,
                failureCount: response.failureCount,
            });
        } catch (error) {
            logError('Send message failed', error, {
                user_id: req.body.user_id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to send message due to server error.',
                    null,
                    'SEND_MESSAGE_ERROR'
                )
            );
        }
    },

    async getFcmToken(req, res) {
        try {
            const FcmToken = await fcmTokensService.getFcmToken(req.params.id);
            if (!FcmToken) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'FCM token not found',
                            null,
                            'FCM_TOKEN_NOT_FOUND'
                        )
                    );
            }
            res.json(FcmToken);
        } catch (error) {
            logError('Get FCM token failed', error, { tokenId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve FCM token.',
                    null,
                    'GET_FCM_TOKEN_ERROR'
                )
            );
        }
    },

    async getTokensForUser(req, res) {
        try {
            const FcmTokens = await fcmTokensService.getTokensForUser(
                req.params.id
            );
            if (!FcmTokens) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'FCM tokens not found',
                            null,
                            'FCM_TOKENS_NOT_FOUND'
                        )
                    );
            }
            res.json(FcmTokens);
        } catch (error) {
            logError('Get FCM tokens for user failed', error, {
                userId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve FCM tokens for user.',
                    null,
                    'GET_USER_FCM_TOKENS_ERROR'
                )
            );
        }
    },

    async getAllFcmTokenes(req, res) {
        try {
            const FcmToken = await fcmTokensService.getAllFcmTokens();
            res.json(FcmToken);
        } catch (error) {
            logError('Get all FCM tokens failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve all FCM tokens.',
                    null,
                    'GET_ALL_FCM_TOKENS_ERROR'
                )
            );
        }
    },

    async updateFcmToken(req, res) {
        try {
            const FcmToken = await fcmTokensService.updateFcmToken(
                req.params.id,
                req.body
            );
            if (!FcmToken || FcmToken.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'FCM token not found',
                            null,
                            'FCM_TOKEN_NOT_FOUND'
                        )
                    );
            }
            res.json(FcmToken);
        } catch (error) {
            logError('Update FCM token failed', error, {
                tokenId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update FCM token.',
                    null,
                    'UPDATE_FCM_TOKEN_ERROR'
                )
            );
        }
    },

    async deleteFcmToken(req, res) {
        try {
            const result = await fcmTokensService.deleteFcmToken(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'FCM token not found',
                            null,
                            'FCM_TOKEN_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'FCM token deleted successfully',
            });
        } catch (error) {
            logError('Delete FCM token failed', error, {
                tokenId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete FCM token.',
                    null,
                    'DELETE_FCM_TOKEN_ERROR'
                )
            );
        }
    },
};
