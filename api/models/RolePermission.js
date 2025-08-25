const { db } = require('../../config/db');

class RolePermission {
  static async assign(role_id, permission_ids) {
    const rows = permission_ids.map((pid) => ({ role_id, permission_id: pid }));
    return db('role_permissions').insert(rows);
  }

  static async update(role_id, permission_ids) {
    return db.transaction(async (trx) => {
      await trx('role_permissions').where({ role_id }).del();

      const newRows = permission_ids.map((pid) => ({
        role_id,
        permission_id: pid,
      }));

      await trx('role_permissions').insert(newRows);
    });
  }

  static async getPermissionsByRoleId(role_id) {
    return db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where({ role_id })
      .select('permission_id', 'name');
  }
}

module.exports = RolePermission;
