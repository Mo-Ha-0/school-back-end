const bcrypt = require('bcrypt-nodejs');
const roleService = require('../api/services/roleService');
const studentService = require('../api/services/studentService');
const teacherService = require('../api/services/teacherService');
const userService = require('../api/services/userService');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    console.log('seeding admin user');
    await knex('users').del();

    let [adminRole] = await knex('roles').where({ name: 'admin' });
    if (!adminRole) {
        [adminRole] = await knex('roles')
            .insert({ name: 'admin' })
            .returning('*');
    }

    const permissions = await knex('permissions').select('id');

    const existingLinks = await knex('role_permissions').where({
        role_id: adminRole.id,
    });

    if (existingLinks.length < permissions.length) {
        const rolePermissions = permissions.map((p) => ({
            role_id: adminRole.id,
            permission_id: p.id,
        }));

        await knex('role_permissions').insert(rolePermissions);
    }

    const hashedPassword = await bcrypt.hashSync('Admin123');
    const existingUser = await knex('users')
        .where({ email: 'admin@system.com' })
        .first();
    if (!existingUser) {
        await knex('users').insert({
            name: 'System Admin',
            email: 'admin@system.com',
            password_hash: hashedPassword,
            role_id: adminRole.id,
            phone: '1234567890',
            birth_date: '1990-01-01',
        });
    }

    const hashedPassword1 = await bcrypt.hashSync('Student123');
    const student = await roleService.getRoleByName('student');

    const existingUser1 = await knex('users')
      .where({ email: 'student@system.com' })
      .first();

    if (!existingUser1) {
      const result = await knex.transaction(async (trx) => {
        // Create user within transaction

        const user =  await userService.createUser({
          name: 'System student',
          email: 'student@system.com',
          password_hash: hashedPassword1,
          phone: '1234567890',
          role_id:student[0].id,
          birth_date: '1990-01-01',
        }, trx);

        // Create student within the same transaction
        const studentCreate = await studentService.createStudent({
          user_id: user[0].id,
          class_id:6,
          curriculum_id:1,
          grade_level:9,
        }, trx);

        return studentCreate;
      });
     console.log(result)

    }

    const hashedPass = await bcrypt.hashSync('Teacher123');
    const teacher = await roleService.getRoleByName('teacher');
    console.log(teacher);
    const existingUser2 = await knex('users')
        .where({ email: 'teacher@system.com' })
        .first();
    if (!existingUser2) {
        const result = await knex.transaction(async (trx) => {
            // Create user within transaction

            const user = await userService.createUser(
                {
                    name: 'System teacher',
                    email: 'teacher@system.com',
                    password_hash: hashedPass,
                    phone: '1234567890',
                    role_id: teacher[0].id,
                    birth_date: '1990-01-01',
                },
                trx
            );

            // Create student within the same transaction
            const teacherCreate = await teacherService.createTeacher(
                {
                    user_id: user[0].id,
                    specialization: 'math',
                    qualification: 'master',
                    hire_date: '2024-12-01',
                },
                trx
            );

            return teacherCreate;
        });
        console.log(result);
    }
};
