const {db} = require('../../config/db');

class Notification {
  static async create(NotificationData) {
    return await db('notifications').insert(NotificationData).returning('*');
  }

  static async findById(id) {
    return await db('notifications').where({ id }).first();
  }
  
  static async findByUserId(id) {
    return await db('notifications').where({ user_id:id }).orderBy('sent_at', 'desc');

  }
  static async findAll() {
    return await db('notifications').select('*') ;
  }

  static async update(id, updates) {
    return await db('notifications').where({ id }).update(updates).returning('*');
  }

  static async updateIsRead(id, user_id) {
    return await db('notifications')
    .where({ id, user_id: user_id })
    .update({ is_read: true }).returning('*');
  }

  static async delete(id) {
    return await db('notifications').where({ id }).del();
  }


}

module.exports = Notification;