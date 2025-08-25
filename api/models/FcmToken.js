const {db} = require('../../config/db');

class FcmToken {
  static async create(FcmTokenData) {
    return await db('fcm_tokens').insert(FcmTokenData).returning('*');
  }

  static async findById(id) {
    return await db('fcm_tokens').where({ id }).first();
  }

  static async getTokensForUser(user_id) {
    return await db('fcm_tokens').where({ user_id, is_active: true })
    .pluck('token');
  }

  static async findAll() {
    return await db('fcm_tokens').select('*') ;
  }

  static async update(id, updates) {
    return await db('fcm_tokens').where({ id }).update(updates).returning('*');
  }

  static async delete(id) {
    return await db('fcm_tokens').where({ id }).del();
  }


}

module.exports = FcmToken;