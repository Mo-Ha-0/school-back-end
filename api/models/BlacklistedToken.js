const { db } = require('../../config/db');

class BlacklistedToken {
  static async create(token, expiresAt) {
    return await db('blacklisted_tokens').insert({
      token,
      expires_at: expiresAt,
    });
  }

  static async findByToken(token) {
    return await db('blacklisted_tokens')
      .where({ token })
      .where('expires_at', '>', db.fn.now())
      .first();
  }
}

module.exports = BlacklistedToken;
