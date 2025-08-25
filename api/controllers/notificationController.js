const notificationService = require('../services/notificationService');

const {  validationResult } = require('express-validator');


module.exports = {

  async createNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const {title,body}=req.body;
      const Notification = await notificationService.createNotification({
        user_id:req.user.id,
        title,
        body,
        sent_at: new Date()
      });
      res.status(201).json(Notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getNotification(req, res) {
    try {
      const Notification = await notificationService.getNotification(req.params.id);
      if (!Notification) return res.status(404).json({ error: 'Notification   not found' });
      res.json(Notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getNotificationsForUser(req, res) {
    try {
      const Notifications = await notificationService.getNotificationsForUser(req.user.id);
      if (!Notifications) return res.status(404).json({ error: 'Notification   not found' });
      res.json(Notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllNotificationes(req, res) {
    try {
      const Notification = await notificationService.getAllNotifications();
      res.json(Notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateNotification(req, res) {
    try {
      const Notification = await notificationService.updateNotification(req.params.id, req.body);
      if (!Notification ||Notification.length==0) return res.status(404).json({ error: 'Notification   not found' });
      res.json(Notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateNotificationIsRead(req, res) {
    try {
      const Notification = await notificationService.updateNotificationIsRead(req.params.id, req.user.id);
      if (!Notification ||Notification.length==0) return res.status(404).json({ error: 'Notification   not found' });
      res.json(Notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteNotification(req, res) {
    try {
      const result = await notificationService.deleteNotification(req.params.id);
      if (!result) return res.status(404).json({ error: 'Notification  not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


};