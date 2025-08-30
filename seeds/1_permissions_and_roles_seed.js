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

        await knex('fcm_tokens').del();

        // Keep existing roles (admin, student, teacher, manager, accountant)
        console.log('✅ Cleared existing permissions and role assignments');

        // ================================================================
        // PHASE 2: CREATE NEW CONSOLIDATED PERMISSIONS
        // ================================================================
        console.log('\n🔑 Phase 2: Creating new consolidated permissions...');

        const permissionsList = [
            // ================================================================
            // CORE ACADEMIC MANAGEMENT (8 permissions)
            // ================================================================
            { name: 'manage_academic_years' }, // CRUD academic years and semesters
            { name: 'manage_subjects' }, // CRUD subjects and curriculums
            { name: 'manage_classes' }, // CRUD classes, view class students
            { name: 'manage_schedules' }, // CRUD schedules, days, periods

            // ================================================================
            // PEOPLE MANAGEMENT (4 permissions)
            // ================================================================
            { name: 'manage_students' }, // CRUD students, view profiles, archives
            { name: 'manage_teachers' }, // CRUD teachers, assign subjects
            { name: 'manage_users' }, // CRUD users and employees
            { name: 'manage_roles' }, // CRUD roles and assign permissions

            // ================================================================
            // ASSESSMENT SYSTEM (4 permissions)
            // ================================================================
            { name: 'manage_exams' }, // CRUD exams, questions, attempts (teacher/admin)
            { name: 'take_exams' }, // Take exams/quizzes, view upcoming (student mobile)
            { name: 'view_exam_results' }, // View exam results and analytics
            { name: 'manage_grades' }, // Input, edit, delete grades and scorecards

            // ================================================================
            // ATTENDANCE SYSTEM (3 permissions)
            // ================================================================
            { name: 'manage_student_attendance' }, // CRUD student attendance
            { name: 'manage_staff_attendance' }, // CRUD teacher/employee attendance
            { name: 'view_attendance_reports' }, // View attendance analytics

            // ================================================================
            // BEHAVIOR SYSTEM (2 permissions)
            // ================================================================
            { name: 'manage_behaviors' }, // CRUD behavior records
            { name: 'view_own_behaviors' }, // View own behaviors (students)

            // ================================================================
            // FINANCIAL SYSTEM (2 permissions)
            // ================================================================
            { name: 'manage_tuition_payments' }, // CRUD and verify payments
            { name: 'view_payment_reports' }, // View financial reports

            // ================================================================
            // COMMUNICATION SYSTEM (3 permissions)
            // ================================================================
            { name: 'manage_notifications' }, // CRUD and send notifications
            { name: 'view_notifications' }, // View notifications (mobile apps)
            { name: 'manage_fcm_tokens' }, // Manage push tokens

            // ================================================================
            // DASHBOARD AND ACCESS (5 permissions)
            // ================================================================
            { name: 'view_dashboard' }, // Access admin dashboard
            { name: 'student_mobile_app' }, // Access student mobile app features
            { name: 'attendance_mobile_app' }, // Access attendance mobile app
            { name: 'export_data' }, // Export reports and data
            { name: 'manage_permissions' }, // Super admin only - manage permissions
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

        // ================================================================
        // STUDENT ROLE - Mobile App Access + Own Data
        // ================================================================
        if (studentRole) {
            const studentPermissions = permissions.filter(
                (p) =>
                    p.name === 'student_mobile_app' || // Mobile app access
                    p.name === 'take_exams' || // Take exams and view upcoming
                    p.name === 'view_exam_results' || // View own exam results
                    p.name === 'view_own_behaviors' || // View own behaviors
                    p.name === 'view_notifications' || // View notifications
                    p.name === 'manage_fcm_tokens' // FCM token management
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

        // ================================================================
        // TEACHER ROLE - Teaching + Attendance App Access
        // ================================================================
        if (teacherRole) {
            const teacherPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_students' || // Student management
                    p.name === 'manage_exams' || // Exam and question management
                    p.name === 'view_exam_results' || // View exam results
                    p.name === 'manage_grades' || // Grade management
                    p.name === 'manage_student_attendance' || // Attendance management
                    p.name === 'manage_behaviors' || // Behavior management
                    p.name === 'manage_schedules' || // Schedule access
                    p.name === 'view_dashboard' || // Dashboard access
                    p.name === 'attendance_mobile_app' || // Attendance app access
                    p.name === 'view_notifications' || // Notifications
                    p.name === 'manage_fcm_tokens' // FCM tokens
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

        // ================================================================
        // MANAGER ROLE - Administrative Access
        // ================================================================
        if (managerRole) {
            const managerPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_students' ||
                    p.name === 'manage_teachers' ||
                    p.name === 'manage_classes' ||
                    p.name === 'manage_subjects' ||
                    p.name === 'manage_academic_years' ||
                    p.name === 'manage_schedules' ||
                    p.name === 'view_exam_results' ||
                    p.name === 'view_attendance_reports' ||
                    p.name === 'manage_behaviors' ||
                    p.name === 'view_dashboard' ||
                    p.name === 'export_data'
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

        // ================================================================
        // ACCOUNTANT ROLE - Financial Management
        // ================================================================
        if (accountantRole) {
            const accountantPermissions = permissions.filter(
                (p) =>
                    p.name === 'manage_tuition_payments' ||
                    p.name === 'view_payment_reports' ||
                    p.name === 'view_dashboard' ||
                    p.name === 'export_data'
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
        console.log(
            `- Created ${permissionsList.length} consolidated permissions`
        );
        console.log('- Assigned ALL permissions to admin role');
        console.log('- Assigned appropriate permissions to other roles');
        console.log(
            '- Added mobile app permissions for student and attendance apps'
        );
        console.log('- Ready to use with the new permission system!');
    } catch (error) {
        console.error('\n❌ ERROR during permissions seeding:', error.message);
        console.error(error.stack);
        throw error;
    }
};
