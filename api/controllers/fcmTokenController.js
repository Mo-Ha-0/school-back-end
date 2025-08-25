const fcmTokensService = require('../services/fcmTokensService');
const userService = require('../services/userService.js');
const roleService = require('../services/roleService.js');
const notificationService = require('../services/notificationService.js');
const {  validationResult } = require('express-validator');
const admin = require('../../firebase/firebase-admin.js');

module.exports = {

  async createFcmToken(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const { token, device_type } = req.body;
      const FcmToken = await fcmTokensService.createFcmToken({
        user_id: req.user.id,
        token,
        device_type,
        created_at: new Date()
      });
      res.status(201).json(FcmToken);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async sendMessage(req, res) {
    try {
      const { user_id, title, body } = req.body;
      const user = await userService.getUser(user_id);
      
      const role = await roleService.getRoleById(user.role_id);
      
      if (role[0].name !== "student") {
        return res.status(400).json({ error: 'User is not a student' });
      }
  
      const FcmTokens = await fcmTokensService.getTokensForUser(user_id);
      if (!FcmTokens || FcmTokens.length === 0) {
        return res.status(404).json({ error: 'FCM tokens not found' });
      }
  
      // Extract token strings from objects (if needed)
      const tokenStrings = FcmTokens.map(token => 
        typeof token === 'string' ? token : token.token
      );
  
      // Filter out any null/undefined tokens
      const validTokens = tokenStrings.filter(token => 
        token && typeof token === 'string' && token.length > 0
      );
  
      if (validTokens.length === 0) {
        return res.status(400).json({ error: 'No valid FCM tokens found' });
      }
  
      const message = {
        notification: { title, body },
        data: { user_id: user_id.toString() }, // Ensure string value
        tokens: validTokens
      };
  
      console.log('Sending to tokens:', validTokens);
  
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(response)
      // Handle response errors
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${validTokens[index]}:`, 
                       resp.error?.code, resp.error?.message);
          
          // Remove invalid tokens from database
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
            fcmTokensService.removeToken(validTokens[index]);
          }
        }
      });
  
      // Create notification only if at least one message was successful
      if (response.successCount > 0) {
        const notification = await notificationService.createNotification({
          user_id: user_id,
          title,
          body,
          sent_at: new Date()
        });
        console.log('Notification created:', notification);
      }
  
      res.json({
        message: 'Process completed',
        successCount: response.successCount,
        failureCount: response.failureCount
      });
  
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getFcmToken(req, res) {
    try {
      const FcmToken = await fcmTokensService.getFcmToken(req.params.id);
      if (!FcmToken) return res.status(404).json({ error: 'Fcm token  not found' });
      res.json(FcmToken);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTokensForUser(req, res) {
    try {
      const FcmTokens = await fcmTokensService.getTokensForUser(req.params.id);
      if (!FcmTokens) return res.status(404).json({ error: 'Fcm tokens  not found' });
      res.json(FcmTokens);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllFcmTokenes(req, res) {
    try {
      const FcmToken = await fcmTokensService.getAllFcmTokens();
      res.json(FcmToken);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateFcmToken(req, res) {
    try {
      const FcmToken = await fcmTokensService.updateFcmToken(req.params.id, req.body);
      if (!FcmToken ||FcmToken.length==0) return res.status(404).json({ error: 'Fcm token  not found' });
      res.json(FcmToken);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteFcmToken(req, res) {
    try {
      const result = await fcmTokensService.deleteFcmToken(req.params.id);
      if (!result) return res.status(404).json({ error: 'Fcm token not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


};