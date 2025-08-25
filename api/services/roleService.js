const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');

module.exports = {
    async createRole(name) {
        const [role] = await Role.create(name);
        return role;
    },

    async getAllRoles() {
        return await Role.findAll();
    },
    async getAllEmployeesRoles() {
        const roles = await Role.findAllEmployees();
        const rolesWithPerms = await Promise.all(
            roles.map(async (r) => {
                const perms = await RolePermission.getPermissionsByRoleId(r.id);
                return {
                    id: r.id,
                    name: r.name,
                    permissions: perms.map((p) => ({
                        permission_id: p.permission_id,
                        permission_name: p.name,
                    })),
                };
            })
        );
        return rolesWithPerms;
    },

    async assignPermissionsToRole(roleId, permissionIds) {
        return await RolePermission.assign(roleId, permissionIds);
    },

    async updatePermissionsToRole(roleId, permissionIds) {
        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            throw new Error('Permission IDs must be a non-empty array');
        }

        return await RolePermission.update(roleId, permissionIds);
    },

    async getPermissionsOfRole(roleId) {
        return await RolePermission.getPermissionsByRoleId(roleId);
    },

    async getRoleByName(name) {
        return await Role.getRoleByName(name);
    },

    async getRoleById(id) {
        return await Role.getRoleById(id);
    },

    async deleteRole(id) {
        return await Role.delete(id);
    },

    async updateRoleName(id, name) {
        const [role] = await Role.update(id, { name });
        return role;
    },
};
