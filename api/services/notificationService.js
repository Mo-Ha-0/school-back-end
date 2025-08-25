const  Notification= require('../models/Notification');

module.exports = {
  async createNotification(NotificationsData) {
    return await Notification.create(NotificationsData);
  },

  async getNotification(id) {
    return await Notification.findById(id);
  },

  async getNotificationsForUser(id) {
    return await Notification.findByUserId(id);
  },

  async getAllNotifications() {
    return await Notification.findAll();
  },

  async updateNotification(id, updates) {
    return await Notification.update(id, updates);
  },

 async updateNotificationIsRead(id, user_id) {
    return await Notification.updateIsRead(id, user_id);
  },

  async deleteNotification(id) {
    return await Notification.delete(id);
  },

};