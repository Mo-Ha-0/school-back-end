const  FcmToken= require('../models/FcmToken');

module.exports = {
  async createFcmToken(fcmTokensData) {
    return await FcmToken.create(fcmTokensData);
  },

  async getFcmToken(id) {
    return await FcmToken.findById(id);
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