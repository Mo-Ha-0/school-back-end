const bcrypt = require('bcrypt-nodejs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    console.log('seeding manager and accountant roles + users');

    // Ensure roles exist (idempotent)
    const ensureRole = async (name) => {
        let role = await knex('roles').where({ name }).first();
        if (!role) {
            [role] = await knex('roles').insert({ name }).returning('*');
        }
        return role;
    };

    const managerRole = await ensureRole('manager');
    const accountantRole = await ensureRole('accountant');

    // Grant all existing permissions to each role (idempotent)
    const permissions = await knex('permissions').select('id');

    const grantAllPermissions = async (roleId) => {
        const existing = await knex('role_permissions')
            .where({ role_id: roleId })
            .select('permission_id');
        const existingSet = new Set(existing.map((e) => e.permission_id));

        const toInsert = permissions
            .filter((p) => !existingSet.has(p.id))
            .map((p) => ({ role_id: roleId, permission_id: p.id }));

        if (toInsert.length > 0) {
            await knex('role_permissions').insert(toInsert);
        }
    };

    await grantAllPermissions(managerRole.id);
    await grantAllPermissions(accountantRole.id);

    // Create 10 users for each role (idempotent by email)
    const createUsersForRole = async (role, emailPrefix, password) => {
        const passwordHash = bcrypt.hashSync(password);
        for (let i = 1; i <= 10; i++) {
            const email = `${emailPrefix}${i}@system.com`;
            const exists = await knex('users').where({ email }).first();
            if (!exists) {
                await knex('users').insert({
                    name: `${
                        role.name.charAt(0).toUpperCase() + role.name.slice(1)
                    } User ${i}`,
                    email,
                    password_hash: passwordHash,
                    role_id: role.id,
                    phone: `00000000${i}`.slice(-10),
                    birth_date: '1990-01-01',
                });
            }
        }
    };

    await createUsersForRole(managerRole, 'manager', 'Manager123');
    await createUsersForRole(accountantRole, 'accountant', 'Accountant123');
};
