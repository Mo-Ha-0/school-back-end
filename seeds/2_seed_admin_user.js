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
    console.log('Seeding system accounts...');

    // Don't delete users here - let other seeds handle that
    // Just check if system accounts exist and create them if they don't

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

    // Create System Admin account
    const hashedPassword = await bcrypt.hashSync('Admin123');
    const existingUser = await knex('users')
        .where({ email: 'admin@system.com' })
        .first();
    if (!existingUser) {
        await knex('users').insert({
            name: 'System Administrator',
            email: 'admin@system.com',
            password_hash: hashedPassword,
            role_id: adminRole.id,
            phone: '+1-555-0123',
            birth_date: '1985-06-15',
        });
        console.log('✓ System Administrator account created');
    } else {
        console.log('✓ System Administrator account already exists');
    }

    // Create System Student account (only if infrastructure exists)
    const hashedPassword1 = await bcrypt.hashSync('Student123');
    const student = await roleService.getRoleByName('student');

    const existingUser1 = await knex('users')
        .where({ email: 'student@system.com' })
        .first();

    if (!existingUser1) {
        // Check if required infrastructure exists
        const curriculumExists = await knex('curriculums')
            .where('id', 1)
            .first();
        const classExists = await knex('classes').where('id', 1).first();

        if (curriculumExists && classExists) {
            const result = await knex.transaction(async (trx) => {
                // Create user within transaction
                const user = await userService.createUser(
                    {
                        name: 'Demo Student',
                        email: 'student@system.com',
                        password_hash: hashedPassword1,
                        phone: '+1-555-0124',
                        role_id: student[0].id,
                        birth_date: '2006-03-22',
                    },
                    trx
                );

                // Create student within the same transaction
                // Note: Using only fields that exist in the actual students table schema
                const studentCreate = await studentService.createStudent(
                    {
                        user_id: user[0].id,
                        class_id: 1,
                        curriculum_id: 1,
                        grade_level: 10,
                    },
                    trx
                );

                return studentCreate;
            });
            console.log('✓ Demo Student account created');
        } else {
            console.log(
                '⚠ Demo Student account skipped - infrastructure not ready yet'
            );
            console.log(
                '   Run infrastructure seeds first, then re-run admin seed'
            );
        }
    } else {
        console.log('✓ Demo Student account already exists');
    }

    // Create System Teacher account (only if infrastructure exists)
    const hashedPass = await bcrypt.hashSync('Teacher123');
    const teacher = await roleService.getRoleByName('teacher');

    const existingUser2 = await knex('users')
        .where({ email: 'teacher@system.com' })
        .first();
    if (!existingUser2) {
        const result = await knex.transaction(async (trx) => {
            // Create user within transaction
            const user = await userService.createUser(
                {
                    name: 'Demo Teacher',
                    email: 'teacher@system.com',
                    password_hash: hashedPass,
                    phone: '+1-555-0126',
                    role_id: teacher[0].id,
                    birth_date: '1988-11-08',
                },
                trx
            );

            // Create teacher within the same transaction
            const teacherCreate = await teacherService.createTeacher(
                {
                    user_id: user[0].id,
                    specialization: 'Mathematics',
                    qualification: 'Master of Education',
                    hire_date: '2022-08-15',
                },
                trx
            );

            return teacherCreate;
        });
        console.log('✓ Demo Teacher account created');
    } else {
        console.log('✓ Demo Teacher account already exists');
    }

    // Create additional system accounts for testing
    const existingUser3 = await knex('users')
        .where({ email: 'principal@system.com' })
        .first();

    if (!existingUser3) {
        let [principalRole] = await knex('roles').where({ name: 'principal' });
        if (!principalRole) {
            [principalRole] = await knex('roles')
                .insert({ name: 'principal' })
                .returning('*');
        }

        const hashedPassword3 = await bcrypt.hashSync('Principal123');
        await knex('users').insert({
            name: 'School Principal',
            email: 'principal@system.com',
            password_hash: hashedPassword3,
            role_id: principalRole.id,
            phone: '+1-555-0127',
            birth_date: '1975-04-12',
        });
        console.log('✓ School Principal account created');
    } else {
        console.log('✓ School Principal account already exists');
    }

    console.log('\nSystem accounts seeding completed!');
    console.log('Default passwords:');
    console.log('- Admin: Admin123');
    console.log('- Student: Student123');
    console.log('- Teacher: Teacher123');
    console.log('- Principal: Principal123');

    console.log(
        '\nNote: If Demo Student was skipped, run infrastructure seeds first, then re-run this seed.'
    );
};
