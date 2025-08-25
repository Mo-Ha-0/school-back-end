const  BlacklistedToken= require('../models/BlacklistedToken');

module.exports = {
  async createBlacklistedToken(token,expiresAt) {
    return await BlacklistedToken.create(token,expiresAt);
  },

  async getBlacklistedToken(id) {
    return await BlacklistedToken.findById(id);
  },

  async getAllBlacklistedTokens() {
    return await BlacklistedToken.findAll();
  },

  async updateBlacklistedToken(id, updates) {
    return await BlacklistedToken.update(id, updates);
  },

  async deleteBlacklistedToken(id) {
    return await BlacklistedToken.delete(id);
  },

 
};