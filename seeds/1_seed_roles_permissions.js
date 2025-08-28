/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    console.log('seeding roles and permissions');
    await knex('role_permissions').del();
    await knex('permissions').del();
    await knex('roles').del();

    const [admin] = await knex('roles')
        .insert([{ name: 'admin' }])
        .returning('*');
    const [student] = await knex('roles')
        .insert([{ name: 'student' }])
        .returning('*');
    const [teacher] = await knex('roles')
        .insert([{ name: 'teacher' }])
        .returning('*');

    const permissionsList = [
        // Academic Years
        { name: 'create_academic_year' },
        { name: 'get_academic_years' },
        { name: 'update_academic_year' },
        { name: 'delete_academic_year' },

        // Answers
        { name: 'create_answer' },
        { name: 'get_answers' },
        { name: 'update_answer' },
        { name: 'delete_answer' },

        // Archives
        { name: 'create_archive' },
        { name: 'get_archives' },
        { name: 'update_archive' },
        { name: 'delete_archive' },

        // Attendance - Employees
        { name: 'create_employees_attendance' },
        { name: 'get_employees_attendance' },
        { name: 'update_employees_attendance' },
        { name: 'delete_employees_attendance' },

        // Attendance - Students
        { name: 'create_students_attendance' },
        { name: 'get_students_attendance' },
        { name: 'update_students_attendance' },
        { name: 'delete_students_attendance' },

        // Attendance - Teachers
        { name: 'create_teachers_attendance' },
        { name: 'get_teachers_attendance' },
        { name: 'update_teachers_attendance' },
        { name: 'delete_teachers_attendance' },

        // Behavior
        { name: 'create_behavior' },
        { name: 'get_behaviors' },
        { name: 'update_behavior' },
        { name: 'delete_behavior' },

        // Classes
        { name: 'create_calss' },
        { name: 'get_classes' },
        { name: 'update_class' },
        { name: 'delete_class' },

        // Curriculum
        { name: 'create_curriculum' },
        { name: 'get_curriculums' },
        { name: 'update_curriculum' },
        { name: 'delete_curriculum' },

        // Days
        { name: 'create_day' },
        { name: 'get_days' },
        { name: 'update_day' },
        { name: 'delete_day' },

        // Exam Questions
        { name: 'create_exam_question' },
        { name: 'get_exam_questions' },
        { name: 'update_exam_question' },
        { name: 'delete_exam_question' },

        // Exams
        { name: 'create_exam' },
        { name: 'get_exams' },
        { name: 'get_preexams' },
        { name: 'get_next_exams' },
        { name: 'update_exam' },
        { name: 'delete_exam' },

        // FCM Tokens
        { name: 'create_fcm_token' },
        { name: 'send_message' },
        { name: 'get_fcm_tokens' },
        { name: 'update_fcm_token' },
        { name: 'delete_fcm_token' },

        // Notifications
        { name: 'create_notification' },
        { name: 'get_notifications' },
        { name: 'update_notification' },
        { name: 'delete_notification' },

        // Options
        { name: 'create_option' },
        { name: 'get_options' },
        { name: 'update_option' },
        { name: 'delete_option' },

        // Periods
        { name: 'create_period' },
        { name: 'get_periods' },
        { name: 'update_period' },
        { name: 'delete_period' },

        // Permissions
        { name: 'create_permission' },
        { name: 'get_permissions' },

        // Questions
        { name: 'create_question' },
        { name: 'get_questions' },
        { name: 'update_question' },
        { name: 'delete_question' },

        // Roles
        { name: 'create_role' },
        { name: 'get_roles' },
        { name: 'update_role' },
        { name: 'delete_role' },

        // Schedules
        { name: 'create_schedule' },
        { name: 'get_schedules' },
        { name: 'update_schedule' },
        { name: 'delete_schedule' },

        // Semesters
        { name: 'create_semester' },
        { name: 'get_semesters' },
        { name: 'update_semester' },
        { name: 'delete_semester' },

        // Students
        { name: 'create_student' },
        { name: 'get_students' },
        { name: 'update_student' },
        { name: 'delete_student' },

        // Subjects
        { name: 'create_subject' },
        { name: 'get_subjects' },
        { name: 'update_subject' },
        { name: 'delete_subject' },

        // Teachers
        { name: 'create_teacher' },
        { name: 'get_teachers' },
        { name: 'update_teacher' },
        { name: 'delete_teacher' },

        // Teacher Subjects
        { name: 'create_teachers_subjects' },

        // Tuition Payments
        { name: 'create_tuition_payment' },
        { name: 'get_tuition_payments' },
        { name: 'update_tuition_payment' },
        { name: 'delete_tuition_payment' },

        // Users
        { name: 'create_user' },
        { name: 'get_users' },
        { name: 'update_user' },
        { name: 'delete_user' },
        // Grades
        { name: 'create_grade' },
        { name: 'get_grades' },
        { name: 'get_grade' },
        { name: 'update_grade' },
        { name: 'delete_grade' },
    ];

    const permissions = await knex('permissions')
        .insert(permissionsList)
        .returning('*');

    const rolePermissions = [
        ...permissions.map((p) => ({ role_id: admin.id, permission_id: p.id })),
    ];

    await knex('role_permissions').insert(rolePermissions);

    const rolePermissions1 = [
        ...permissions.map((p) => ({
            role_id: student.id,
            permission_id: p.id,
        })),
    ];

    await knex('role_permissions').insert(rolePermissions1);

    const rolePermissions2 = [
        ...permissions.map((p) => ({
            role_id: teacher.id,
            permission_id: p.id,
        })),
    ];

    await knex('role_permissions').insert(rolePermissions2);
};
