const { db } = require('../../config/db');

class Permission {
  static async findAll() {
    return db('permissions').select('*');
  }

  static async create(permissionData) {
    return db('permissions').insert(permissionData).returning('*');
  }
}

module.exports = Permission;
