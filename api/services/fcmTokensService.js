const  FcmToken= require('../models/FcmToken');
const admin = require('firebase-admin');
const userService = require('./userService');
const roleService = require('./roleService');
const notificationService = require('./notificationService');
const {
  createErrorResponse,
  HTTP_STATUS,
  handleValidationErrors,
  logError,
} = require('../utils/errorHandler');

module.exports = {
  async createFcmToken(fcmTokensData) {
    return await FcmToken.create(fcmTokensData);
  },

  async getFcmToken(id) {
    return await FcmToken.findById(id);
  },
  async sendMessage(user_id, title, body) {
    try {
        const user = await userService.getUser(user_id);
        const role = await roleService.getRoleById(user.role_id);

        if (role[0].name !== 'student') {
            throw {
                status: 400,
                code: 'USER_NOT_STUDENT',
                message: 'User is not a student'
            };
        }

        const FcmTokens = await this.getTokensForUser(user_id);
        if (!FcmTokens || FcmTokens.length === 0) {
            throw {
                status: 404,
                code: 'FCM_TOKENS_NOT_FOUND',
                message: 'FCM tokens not found'
            };
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
            throw {
                status: 400,
                code: 'NO_VALID_FCM_TOKENS',
                message: 'No valid FCM tokens found'
            };
        }

        const message = {
            notification: { title, body },
            data: { user_id: user_id.toString() },
            tokens: validTokens,
        };

        console.log('Sending to tokens:', validTokens);

        const response = await admin
            .messaging()
            .sendEachForMulticast(message);
        
        console.log('FCM Response:', response);

        // Handle response errors and remove invalid tokens
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
                  console.log('sdf')
                    // this.removeToken(validTokens[index]);
                }
            }
        });

        // Create notification only if at least one message was successful
        let notification = null;
        if (response.successCount > 0) {
            notification = await notificationService.createNotification({
                user_id: user_id,
                title,
                body,
                sent_at: new Date(),
            });
            console.log('Notification created:', notification);
        }

        return {
            success: true,
            data: {
                successCount: response.successCount,
                failureCount: response.failureCount,
                notification
            },
            message: 'Message sent successfully'
        };

    } catch (error) {
        logError('Send message failed', error, { user_id });
        
        // If it's a known error with status, rethrow it
        if (error.status) {
            throw error;
        }
        
        // For unexpected errors
        throw {
            status: 500,
            code: 'SEND_MESSAGE_ERROR',
            message: 'Failed to send message due to server error.',
            originalError: error.message
        };
    }
},
  async getTokensForUser(user_id) {
    return await FcmToken.getTokensForUser(user_id);
  },

  async getAllFcmTokens() {
    return await FcmToken.findAll();
  },

  async updateFcmToken(id, updates) {
    return await FcmToken.update(id, updates);
  },

  async deleteFcmToken(id) {
    return await FcmToken.delete(id);
  },

};