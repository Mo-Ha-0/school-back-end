const bcrypt = require('bcrypt-nodejs');

/**
 * Permissions and Roles Seeder
 *
 * This seed file creates the new consolidated permissions and assigns them to the admin role.
 * It should be run after the main comprehensive seed to update the permission system.
 */
exports.seed = async function (knex) {
    console.log('🔑 Starting Permissions and Roles Seeding');
    console.log('='.repeat(50));

    try {
        // ================================================================
        // PHASE 1: CLEAR EXISTING PERMISSIONS AND ROLE ASSIGNMENTS
        // ================================================================
        console.log(
            '\n🧹 Phase 1: Clearing existing permissions and role assignments...'
        );

        // Clear role permissions first (due to foreign key constraints)
        await knex('role_permissions').del();

        // Clear existing permissions
        await knex('permissions').del();

        // Keep existing roles (admin, student, teacher, manager, accountant)
        console.log('✅ Cleared existing permissions and role assignments');

        // ================================================================
        // PHASE 2: CREATE NEW CONSOLIDATED PERMISSIONS
        // ================================================================
        console.log('\n🔑 Phase 2: Creating new consolidated permissions...');

        const permissionsList = [
            // Academic Management
            { name: 'manage_academic_years' }, // create, read, update, delete academic years
            { name: 'manage_semesters' }, // create, read, update, delete semesters
            { name: 'manage_curriculums' }, // create, read, update, delete curriculums
            { name: 'manage_subjects' }, // create, read, update, delete subjects
            { name: 'manage_classes' }, // create, read, update, delete classes

            // Student Management
            { name: 'manage_students' }, // create, read, update, delete students
            { name: 'view_student_profiles' }, // get student profiles, grades, exams
            { name: 'manage_student_archives' }, // create, read, update, delete archives

            // Teacher Management
            { name: 'manage_teachers' }, // create, read, update, delete teachers
            { name: 'assign_teacher_subjects' }, // assign teachers to subjects
            { name: 'view_teacher_schedules' }, // view teacher schedules and classes

            // Exam Management
            { name: 'manage_exams' }, // create, read, update, delete exams
            { name: 'manage_questions' }, // create, read, update, delete questions and options
            { name: 'manage_exam_attempts' }, // create, read, update, delete exam attempts
            { name: 'view_exam_results' }, // view exam results and analytics

            // Grade Management
            { name: 'manage_grades' }, // create, read, update, delete grades

            // Attendance Management
            { name: 'manage_student_attendance' }, // create, read, update, delete student attendance
            { name: 'manage_teacher_attendance' }, // create, read, update, delete teacher attendance
            { name: 'manage_employee_attendance' }, // create, read, update, delete employee attendance
            { name: 'view_attendance_reports' }, // view attendance reports and analytics

            // Behavior Management
            { name: 'manage_behaviors' }, // create, read, update, delete behaviors
            { name: 'view_behavior_reports' }, // view behavior reports and analytics

            // Schedule Management
            { name: 'manage_schedules' }, // create, read, update, delete schedules
            { name: 'manage_days_periods' }, // create, read, update, delete days and periods

            // Financial Management
            { name: 'manage_tuition_payments' }, // create, read, update, delete tuition payments

            // User Management
            { name: 'manage_users' }, // create, read, update, delete users
            { name: 'manage_roles' }, // create, read, update, delete roles
            { name: 'manage_permissions' }, // create, read, update, delete permissions

            // System Management
            { name: 'view_dashboard' }, // view system dashboard and analytics
            { name: 'manage_notifications' }, // create, read, update, delete notifications
            { name: 'manage_fcm_tokens' }, // manage push notification tokens
        ];

        const permissions = await knex('permissions')
            .insert(permissionsList)
            .returning('*');

        console.log(
            `✅ Created ${permissions.length} consolidated permissions`
        );

        // ================================================================
        // PHASE 3: GET EXISTING ROLES
        // ================================================================
        console.log('\n👥 Phase 3: Getting existing roles...');

        const roles = await knex('roles').select('*');
        const adminRole = roles.find((role) => role.name === 'admin');

        if (!adminRole) {
            throw new Error(
                'Admin role not found. Please run the main seed first.'
            );
        }

        console.log(`✅ Found admin role with ID: ${adminRole.id}`);

        // ================================================================
        // PHASE 4: ASSIGN ALL PERMISSIONS TO ADMIN ROLE
        // ================================================================
        console.log('\n🔗 Phase 4: Assigning all permissions to admin role...');

        const rolePermissions = [];
        for (const permission of permissions) {
            rolePermissions.push({
                role_id: adminRole.id,
                permission_id: permission.id,
            });
        }

        await knex('role_permissions').insert(rolePermissions);
        console.log(
            `✅ Assigned all ${permissions.length} permissions to admin role`
        );

        // ================================================================
        // PHASE 5: ASSIGN BASIC PERMISSIONS TO OTHER ROLES
        // ================================================================
        console.log(
            '\n👥 Phase 5: Assigning basic permissions to other roles...'
        );

        const studentRole = roles.find((role) => role.name === 'student');
        const teacherRole = roles.find((role) => role.name === 'teacher');
        const managerRole = roles.find((role) => role.name === 'manager');
        const accountantRole = roles.find((role) => role.name === 'accountant');

        // Student permissions - basic viewing and self-management
        if (studentRole) {
            const studentPermissions = permissions.filter(
                (p) =>
                    p.name === 'view_student_profiles' ||
                    p.name === 'view_exam_results' ||
                    p.name === 'view_grade_reports'
            );

            const studentRolePermissions = studentPermissions.map((p) => ({
                role_id: studentRole.id,
                permission_id: p.id,
            }));

            await knex('role_permissions').insert(studentRolePermissions);
            console.log(
                `✅ Assigned ${studentPermissions.length} permissions to student role`
            );
        }

        // Teacher permissions - teaching and grading related
        if (teacherRole) {
            const teacherPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_students' ||
                    p.name === 'view_student_profiles' ||
                    p.name === 'manage_grades' ||
                    p.name === 'view_grade_reports' ||
                    p.name === 'manage_exams' ||
                    p.name === 'manage_questions' ||
                    p.name === 'manage_exam_attempts' ||
                    p.name === 'view_exam_results' ||
                    p.name === 'manage_student_attendance' ||
                    p.name === 'manage_behaviors' ||
                    p.name === 'view_teacher_schedules' ||
                    p.name === 'manage_schedules' ||
                    p.name === 'view_dashboard'
            );

            const teacherRolePermissions = teacherPermissions.map((p) => ({
                role_id: teacherRole.id,
                permission_id: p.id,
            }));

            await knex('role_permissions').insert(teacherRolePermissions);
            console.log(
                `✅ Assigned ${teacherPermissions.length} permissions to teacher role`
            );
        }

        // Manager permissions - administrative but not system-level
        if (managerRole) {
            const managerPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_students' ||
                    p.name === 'manage_teachers' ||
                    p.name === 'manage_classes' ||
                    p.name === 'manage_subjects' ||
                    p.name === 'manage_academic_years' ||
                    p.name === 'manage_semesters' ||
                    p.name === 'manage_curriculums' ||
                    p.name === 'manage_schedules' ||
                    p.name === 'manage_days_periods' ||
                    p.name === 'view_student_profiles' ||
                    p.name === 'view_teacher_schedules' ||
                    p.name === 'view_attendance_reports' ||
                    p.name === 'view_behavior_reports' ||
                    p.name === 'view_dashboard'
            );

            const managerRolePermissions = managerPermissions.map((p) => ({
                role_id: managerRole.id,
                permission_id: p.id,
            }));

            await knex('role_permissions').insert(managerRolePermissions);
            console.log(
                `✅ Assigned ${managerPermissions.length} permissions to manager role`
            );
        }

        // Accountant permissions - financial and basic viewing
        if (accountantRole) {
            const accountantPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_tuition_payments' ||
                    p.name === 'view_payment_reports' ||
                    p.name === 'verify_payments' ||
                    p.name === 'view_student_profiles' ||
                    p.name === 'view_dashboard'
            );

            const accountantRolePermissions = accountantPermissions.map(
                (p) => ({
                    role_id: accountantRole.id,
                    permission_id: p.id,
                })
            );

            await knex('role_permissions').insert(accountantRolePermissions);
            console.log(
                `✅ Assigned ${accountantPermissions.length} permissions to accountant role`
            );
        }

        // ================================================================
        // PHASE 6: VERIFICATION
        // ================================================================
        console.log('\n✅ Phase 6: Final verification...');

        // Count total permissions
        const totalPermissions = await knex('permissions').count('* as count');

        // Count admin permissions
        const adminPermissions = await knex('role_permissions')
            .where('role_id', adminRole.id)
            .count('* as count');

        // Count role permissions for each role
        const rolePermissionCounts = await knex('role_permissions')
            .join('roles', 'role_permissions.role_id', 'roles.id')
            .groupBy('roles.name')
            .select('roles.name', knex.raw('COUNT(*) as count'));

        console.log(`📊 Final Statistics:`);
        console.log(
            `- Total permissions created: ${totalPermissions[0].count}`
        );
        console.log(`- Admin permissions: ${adminPermissions[0].count}`);
        console.log(`\nRole Permission Distribution:`);

        rolePermissionCounts.forEach((role) => {
            console.log(`  - ${role.name}: ${role.count} permissions`);
        });

        console.log(
            '\n🎉 PERMISSIONS AND ROLES SEEDING COMPLETED SUCCESSFULLY!'
        );
        console.log('='.repeat(50));
        console.log('\n📝 Summary:');
        console.log('- Created 30 consolidated permissions');
        console.log('- Assigned ALL permissions to admin role');
        console.log('- Assigned appropriate permissions to other roles');
        console.log('- Ready to use with the new permission system!');
    } catch (error) {
        console.error('\n❌ ERROR during permissions seeding:', error.message);
        console.error(error.stack);
        throw error;
    }
};
