const roleService = require('../services/roleService');
const { db } = require('../../config/db');

module.exports = {
    async createRole(req, res) {
        try {
            const { name, permissions } = req.body;

            const exists = await roleService.getRoleByName(name);

            if (!exists[0]) {
                const permissionsFromDB = await db('permissions').select('id');
                const Ids = permissionsFromDB.map((id) => id.id);

                const allValid = permissions.every((permission) =>
                    Ids.includes(permission)
                );
                if (allValid === false) {
                    console.log('object');
                    return res.json({ error: 'invalid permissions' });
                }

                const role = await roleService.createRole({ name });

                if (permissions.length > 0) {
                    var permissionIds = await db('permissions')
                        .whereIn('id', permissions)
                        .select('*');
                    if (permissionIds.length > 0) {
                        const pIds = permissionIds.map((id) => id.id);

                        const result =
                            await roleService.assignPermissionsToRole(
                                role.id,
                                pIds
                            );
                    }
                }
                return res
                    .status(201)
                    .json({ role, permission_ids: permissionIds });
            }

            return res.json({ error: 'role already exists' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async getAllRoles(req, res) {
        try {
            const roles = await roleService.getAllRoles();
            res.status(200).json(roles);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllEmployeesRoles(req, res) {
        try {
            const roles = await roleService.getAllEmployeesRoles();

            res.status(200).json(roles);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updatePermissions(req, res) {
        try {
            const { roleId, permissions } = req.body;
            const roleIdNum = parseInt(roleId, 10);
            const exists = await roleService.getRoleById(roleIdNum);

            if (exists[0]) {
                if (permissions.length > 0) {
                    var permissionIds = await db('permissions')
                        .whereIn('id', permissions)
                        .select('*');

                    if (permissionIds.length > 0) {
                        const pIds = permissionIds.map((id) => id.id);

                        const result =
                            await roleService.updatePermissionsToRole(
                                exists[0].id,
                                pIds
                            );
                    }
                }
                return res
                    .status(201)
                    .json({ role: exists[0], permission_ids: permissionIds });
            }

            return res.json({ error: "role doesn't exists" });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err.message });
        }
    },

    async getRolePermissions(req, res) {
        try {
            const { roleId } = req.params;
            const roleIdNum = parseInt(roleId, 10);
            const role = await roleService.getRoleById(roleIdNum);
            console.log(role);
            if (!role[0]) return res.json({ error: "role doesn't exists" });
            const permissions = await roleService.getPermissionsOfRole(
                roleIdNum
            );

            res.status(200).json(permissions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteRole(req, res) {
        try {
            const { roleId } = req.params;
            const role = await roleService.deleteRole(roleId);

            if (!role) return res.status(404).json({ error: 'Role not found' });

            res.status(200).json({ message: 'deleted successfuly' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async updateRoleName(req, res) {
        try {
            const { roleId } = req.params;
            const { name } = req.body;
            if (!name || typeof name !== 'string') {
                return res.status(400).json({ error: 'Invalid role name' });
            }
            const updated = await roleService.updateRoleName(
                parseInt(roleId, 10),
                name
            );
            if (!updated)
                return res.status(404).json({ error: 'Role not found' });
            res.status(200).json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};
