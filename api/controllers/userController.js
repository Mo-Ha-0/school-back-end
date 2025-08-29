const userService = require('../services/userService');
const studentService = require('../services/studentService');
const teacherService = require('../services/teacherService');
const blackListTokenService = require('../services/blackListTokenService');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt-nodejs');
const { db } = require('../../config/db');
const jwt = require('jsonwebtoken');
const { messaging } = require('firebase-admin');
const roleService = require('../services/roleService');
const { stripSensitive } = require('../utils/sanitize');
const { toDateOnly } = require('../utils/dateUtils');
const { 
    createErrorResponse, 
    HTTP_STATUS, 
    handleValidationErrors,
    logError,
    asyncErrorHandler
} = require('../utils/errorHandler');
require('dotenv').config();
module.exports = {
    async signIn(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    handleValidationErrors(errors)
                );
            }

            const { email, password } = req.body;

            // 1. First check if user exists
            const user = await db
                .select('*')
                .from('users')
                .where('email', '=', email)
                .first();

            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                    createErrorResponse(
                        'Invalid email or password.',
                        null,
                        'INVALID_CREDENTIALS'
                    )
                );
            }

            // 2. Validate password
            const isValid = bcrypt.compareSync(password, user.password_hash);

            if (!isValid) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                    createErrorResponse(
                        'Invalid email or password.',
                        null,
                        'INVALID_CREDENTIALS'
                    )
                );
            }

            // 3. Generate token (exclude sensitive data)
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    roleId: user.role_id,
                },
                process.env.JWT_SECRET,
                { expiresIn: '10d' }
            );

            // 4. Return user data (without password)
            let userData = await userService.removeHashedPassword(user);
            let userAll = await userService.removeTimeStamp(userData);
            const result = await userService.findUserWithRole(user.id);

            // Always add the role name to userAll
            userAll = { ...userAll, role: result.role };

            if (result.role == 'student') {
                const student = await studentService.findByUserId(user.id);
                if (student) {
                    let studentData = await userService.removeTimeStamp(student);
                    userAll = { ...userAll, ...studentData };
                }
            } else if (result.role == 'teacher') {
                const teacher = await teacherService.findByUserId(user.id);
                if (teacher) {
                    userAll = { ...userAll, ...teacher };
                }
            }
            
            res.json({ user: userAll, token });
        } catch (error) {
            logError('User signIn failed', error, {
                email: req.body.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Sign in failed due to server error.',
                    null,
                    'SIGNIN_ERROR'
                )
            );
        }
    },

    async createUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    handleValidationErrors(errors)
                );
            }
            
            const { name, email, role_id, phone, birth_date } = req.body;

            const password = userService.generateRandomPassword();
            const hash = bcrypt.hashSync(password);
            const roles = await roleService.getAllRoles();
            const validRole = roles.filter((role) => role_id === role.id);

            if (validRole.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    createErrorResponse(
                        'Invalid role ID provided.',
                        null,
                        'INVALID_ROLE'
                    )
                );
            }
            
            const user = await userService.createUser({
                name: name,
                birth_date: birth_date,
                email: email,
                phone: phone,
                role_id: validRole[0].id,
                password_hash: hash,
            });

            const userData = await userService.removeHashedPassword(user[0]);
            res.status(HTTP_STATUS.CREATED).json(userData);
        } catch (error) {
            logError('Create user failed', error, {
                email: req.body.email,
                role_id: req.body.role_id,
                createdBy: req.user?.id
            });
            
            // Handle duplicate email error
            if (error.code === '23505') {
                return res.status(HTTP_STATUS.CONFLICT).json(
                    createErrorResponse(
                        'User with this email already exists.',
                        null,
                        'EMAIL_EXISTS'
                    )
                );
            }
            
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create user due to server error.',
                    null,
                    'CREATE_USER_ERROR'
                )
            );
        }
    },

    async getUser(req, res) {
        try {
            const user = await userService.getUser(req.params.id);
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('User not found.', null, 'USER_NOT_FOUND')
                );
            }
            const userData = await userService.removeHashedPassword(user);
            res.json(stripSensitive(userData));
        } catch (error) {
            logError('Get user failed', error, { userId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to retrieve user.', null, 'GET_USER_ERROR')
            );
        }
    },

    async getUserByToken(req, res) {
        try {
            const userId = req.user.id;
            let user = await db('users')
                .join('roles', 'roles.id', 'users.role_id')
                .where('users.id', userId)
                .select(
                    'users.id as user_id',
                    'users.name',
                    'users.email',
                    'roles.id as role_id',
                    'roles.name as role_name',
                    'users.phone',
                    'users.birth_date'
                );
                
            if (!user || user.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('User not found.', null, 'USER_NOT_FOUND')
                );
            }
            
            const role = await roleService.getRoleById(user[0].role_id);
            if (role[0].name === 'student') {
                user = await db('users')
                    .join('students', 'students.user_id', 'users.id')
                    .join('roles', 'roles.id', 'users.role_id')
                    .join('classes', 'classes.id', 'students.class_id')
                    .join(
                        'curriculums',
                        'curriculums.id',
                        'students.curriculum_id'
                    )
                    .where('user_id', user[0].user_id)
                    .select(
                        'students.user_id',
                        'students.id as student_id',
                        'users.name',
                        'users.email',
                        'roles.id as role_id',
                        'roles.name as role_name',
                        'users.phone',
                        'users.birth_date',
                        'students.class_id',
                        'classes.class_name',
                        'classes.floor_number',
                        'students.curriculum_id',
                        'curriculums.is_active as is_curriculum_active',
                        'students.grade_level'
                    );
            } else if (role[0].name === 'teacher') {
                user = await db('users')
                    .join('teachers', 'teachers.user_id', 'users.id')
                    .join('roles', 'roles.id', 'users.role_id')
                    .where('user_id', user[0].user_id)
                    .select(
                        'teachers.user_id',
                        'teachers.id as teacher_id',
                        'users.name',
                        'users.email',
                        'roles.id as role_id',
                        'roles.name as role_name',
                        'users.phone',
                        'users.birth_date',
                        'teachers.specialization',
                        'teachers.hire_date',
                        'teachers.qualification'
                    );
            }
            
            if (!user[0]) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('User profile not found.', null, 'USER_PROFILE_NOT_FOUND')
                );
            }

            const permissions = await roleService.getPermissionsOfRole(
                role[0].id
            );

            const filterPermissions = permissions.map((el) => el.name);

            res.json(stripSensitive({ user, permissions: filterPermissions }));
        } catch (error) {
            logError('Get user by token failed', error, { userId: req.user?.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to retrieve user profile.', null, 'GET_USER_PROFILE_ERROR')
            );
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(stripSensitive(users));
        } catch (error) {
            logError('Get all users failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to retrieve users.', null, 'GET_USERS_ERROR')
            );
        }
    },

    async updateUser(req, res) {
        try {
            const { name, email, phone, birth_date, role_id } = req.body;
            
            if (!role_id && !name && !email && !phone && !birth_date) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    createErrorResponse(
                        'At least one field must be provided to update.',
                        null,
                        'NO_UPDATE_FIELDS'
                    )
                );
            }
            
            const user = await userService.updateUser(req.params.id, req.body);
            if (!user || user.length == 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('User not found.', null, 'USER_NOT_FOUND')
                );
            }
            res.json(stripSensitive(user));
        } catch (error) {
            logError('Update user failed', error, { userId: req.params.id });
            
            if (error.code === '23505') {
                return res.status(HTTP_STATUS.CONFLICT).json(
                    createErrorResponse('Email already exists.', null, 'EMAIL_EXISTS')
                );
            }
            
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to update user.', null, 'UPDATE_USER_ERROR')
            );
        }
    },

    async deleteUser(req, res) {
        try {
            const result = await userService.deleteUser(req.params.id);
            if (!result) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('User not found.', null, 'USER_NOT_FOUND')
                );
            }
            res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
        } catch (error) {
            logError('Delete user failed', error, { userId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to delete user.', null, 'DELETE_USER_ERROR')
            );
        }
    },

    async search(req, res) {
        try {
            const users = await userService.search(req.params.name);
            res.json(stripSensitive(users));
        } catch (error) {
            logError('User search failed', error, { searchTerm: req.params.name });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to search users.', null, 'SEARCH_USERS_ERROR')
            );
        }
    },

    async paginate(req, res) {
        try {
            const users = await userService.paginate(req.body);
            res.json(stripSensitive(users));
        } catch (error) {
            logError('User pagination failed', error, { paginationData: req.body });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to paginate users.', null, 'PAGINATE_USERS_ERROR')
            );
        }
    },

    async getEmployees(req, res) {
        try {
            const employees = await userService.getEmployees();
            if (!employees || employees.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(
                    createErrorResponse('No employees found.', null, 'NO_EMPLOYEES_FOUND')
                );
            }
            const formatted = employees.map((emp) => ({
                ...emp,
                birth_date: toDateOnly(emp.birth_date),
            }));
            res.status(HTTP_STATUS.OK).json(stripSensitive(formatted));
        } catch (error) {
            logError('Get employees failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Failed to retrieve employees.', null, 'GET_EMPLOYEES_ERROR')
            );
        }
    },

    async signOut(req, res) {
        try {
            const token =
                req.headers.authorization?.split(' ')[1] || req.headers.token;
            if (!token) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    createErrorResponse('No authentication token provided.', null, 'NO_TOKEN')
                );
            }

            // Decode token to get expiration time
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const expiresAt = new Date(decoded.exp * 1000);

            // Add token to blacklist
            await blackListTokenService.createBlacklistedToken(
                token,
                expiresAt
            );

            res.json({ message: 'Successfully signed out' });
        } catch (error) {
            logError('Sign out failed', error, { userId: req.user?.id });
            
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    createErrorResponse('Invalid token provided.', null, 'INVALID_TOKEN')
                );
            }
            
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse('Sign out failed due to server error.', null, 'SIGNOUT_ERROR')
            );
        }
    },
};
