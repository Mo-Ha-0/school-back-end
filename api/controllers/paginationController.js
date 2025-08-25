const { db } = require('../../config/db');
const { validationResult } = require('express-validator');
const { toDateOnly } = require('../utils/dateUtils');
const { stripSensitive } = require('../utils/sanitize');

module.exports = {
    async paginateTable(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                table,
                page = 1,
                pageSize = 10,
                orderBy = 'id',
                orderDirection = 'asc',
            } = req.body;

            if (!table || !['students', 'teachers', 'users'].includes(table)) {
                return res.status(400).json({
                    error: 'Invalid table parameter. Must be "students", "teachers", or "users"',
                });
            }

            const pageNum = parseInt(page);
            const pageSizeNum = parseInt(pageSize);

            if (pageNum < 1 || pageSizeNum < 1) {
                return res.status(400).json({
                    error: 'Page and pageSize must be positive integers',
                });
            }

            const validOrderDirections = ['asc', 'desc'];
            if (!validOrderDirections.includes(orderDirection.toLowerCase())) {
                return res.status(400).json({
                    error: 'orderDirection must be "asc" or "desc"',
                });
            }

            let validOrderByFields;
            if (table === 'students') {
                validOrderByFields = [
                    'id',
                    'grade_level',
                    'name',
                    'email',
                    'class_name',
                    'curriculum_grade',
                ];
            } else if (table === 'teachers') {
                validOrderByFields = [
                    'id',
                    'specialization',
                    'qualification',
                    'name',
                    'email',
                    'hire_date',
                ];
            } else if (table === 'users') {
                validOrderByFields = [
                    'id',
                    'name',
                    'email',
                    'role_id',
                    'phone',
                    'birth_date',
                ];
            }

            if (!validOrderByFields.includes(orderBy)) {
                return res.status(400).json({
                    error: `Invalid orderBy field for ${table}. Valid fields are: ${validOrderByFields.join(
                        ', '
                    )}`,
                });
            }

            let orderByColumn;
            if (table === 'students') {
                switch (orderBy) {
                    case 'name':
                    case 'email':
                    case 'phone':
                    case 'birth_date':
                        orderByColumn = `users.${orderBy}`;
                        break;
                    case 'class_name':
                        orderByColumn = 'classes.class_name';
                        break;
                    case 'curriculum_grade':
                        orderByColumn = 'curriculums.level_grade';
                        break;
                    case 'grade_level':
                        orderByColumn = 'students.grade_level';
                        break;
                    case 'id':
                        orderByColumn = 'students.id';
                        break;
                    default:
                        orderByColumn = `students.${orderBy}`;
                }
            } else if (table === 'teachers') {
                switch (orderBy) {
                    case 'name':
                    case 'email':
                    case 'phone':
                    case 'birth_date':
                        orderByColumn = `users.${orderBy}`;
                        break;
                    case 'hire_date':
                        orderByColumn = 'teachers.hire_date';
                        break;
                    case 'specialization':
                        orderByColumn = 'teachers.specialization';
                        break;
                    case 'qualification':
                        orderByColumn = 'teachers.qualification';
                        break;
                    case 'id':
                        orderByColumn = 'teachers.id';
                        break;
                    default:
                        orderByColumn = `teachers.${orderBy}`;
                }
            } else if (table === 'users') {
                switch (orderBy) {
                    case 'id':
                        orderByColumn = 'users.id';
                        break;
                    case 'name':
                        orderByColumn = 'users.name';
                        break;
                    case 'email':
                        orderByColumn = 'users.email';
                        break;
                    case 'role_id':
                        orderByColumn = 'users.role_id';
                        break;
                    case 'phone':
                        orderByColumn = 'users.phone';
                        break;
                    case 'birth_date':
                        orderByColumn = 'users.birth_date';
                        break;
                    default:
                        orderByColumn = 'users.id';
                }
            }

            if (!orderByColumn) {
                if (table === 'students') {
                    orderByColumn = 'students.id';
                } else if (table === 'teachers') {
                    orderByColumn = 'teachers.id';
                } else if (table === 'users') {
                    orderByColumn = 'users.id';
                }
            }

            let query;
            let countQuery;

            if (table === 'students') {
                query = db('students')
                    .leftJoin('users', 'students.user_id', 'users.id')
                    .leftJoin('classes', 'students.class_id', 'classes.id')
                    .leftJoin(
                        'curriculums',
                        'students.curriculum_id',
                        'curriculums.id'
                    )
                    .select(
                        'students.id',
                        'students.grade_level',
                        'students.created_at as student_created_at',
                        'users.name',
                        'users.email',
                        'users.phone',
                        'users.birth_date',
                        'classes.class_name',
                        'curriculums.level_grade as curriculum_grade'
                    )
                    .orderBy(orderByColumn, orderDirection)
                    .limit(pageSizeNum)
                    .offset((pageNum - 1) * pageSizeNum);

                countQuery = db('students').count('* as total');
            } else if (table === 'teachers') {
                query = db('teachers')
                    .leftJoin('users', 'teachers.user_id', 'users.id')
                    .select(
                        'teachers.id',
                        'teachers.specialization',
                        'teachers.hire_date',
                        'teachers.qualification',
                        'users.name',
                        'users.email',
                        'users.phone',
                        'users.birth_date'
                    )
                    .orderBy(orderByColumn, orderDirection)
                    .limit(pageSizeNum)
                    .offset((pageNum - 1) * pageSizeNum);

                countQuery = db('teachers').count('* as total');
            } else if (table === 'users') {
                query = db('users')
                    .select(
                        'id',
                        'name',
                        'email',
                        'role_id',
                        'phone',
                        'birth_date'
                    )
                    .orderBy(orderByColumn, orderDirection)
                    .limit(pageSizeNum)
                    .offset((pageNum - 1) * pageSizeNum);

                countQuery = db('users').count('* as total');
            }

            // console.log('Generated query:', query.toString());
            const [data, countResult] = await Promise.all([query, countQuery]);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / pageSizeNum);

            const formatedData = data.map((e) => {
                const formatted = {
                    ...e,
                    birth_date: toDateOnly(e.birth_date),
                };

                if (e.hire_date) {
                    formatted.hire_date = toDateOnly(e.hire_date);
                }

                return formatted;
            });

            const strippedData = stripSensitive(formatedData);

            // // Convert array to object with numeric keys for userData
            // const userData = {};
            // strippedData.forEach((item, index) => {
            //     userData[index] = item;
            // });

            res.json({
                page: pageNum,
                pageSize: pageSizeNum,
                total,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPreviousPage: pageNum > 1,
                table,
                data: strippedData,
            });
        } catch (error) {
            console.error('Pagination error:', error);

            // Handle specific database errors
            if (error.code === '42703') {
                return res.status(400).json({
                    error: 'Invalid column reference in query',
                    details:
                        'The requested ordering field does not exist in the database',
                    field: orderBy,
                });
            }

            res.status(500).json({
                error: 'Internal server error during pagination',
                details: error.message,
            });
        }
    },
};
