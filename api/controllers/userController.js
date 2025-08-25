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
require('dotenv').config();
module.exports = {
    async signIn(req, res) {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // 1. First check if user exists
            const user = await db
                .select('*')
                .from('users')
                .where('email', '=', email)
                .first();

            if (!user) {
                return res.status(400).json('Wrong credentials');
            }

            // 2. Validate password
            const isValid = bcrypt.compareSync(password, user.password_hash);

            if (!isValid) {
                return res.status(400).json('Wrong credentials');
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
            console.log(result);

            // Always add the role name to userAll
            userAll = { ...userAll, role: result.role };

            if (result.role == 'student') {
                const student = await studentService.findByUserId(user.id);
                let studentData = await userService.removeTimeStamp(student);
                userAll = { ...userAll, ...studentData };
            } else if (result.role == 'teacher') {
                const teacher = await teacherService.findByUserId(user.id);
                userAll = { ...userAll, ...teacher };
            }
            res.json({ user: userAll, token });
        } catch (err) {
            console.error('SignIn error:', err);
            res.status(500).json('Internal server error');
        }
    },

    async createUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() });
            }
            const { name, email, role_id, phone, birth_date } = req.body;

            const password = userService.generateRandomPassword();
            console.log(password);
            const hash = bcrypt.hashSync(password);
            const role = await roleService.getAllRoles();
            const validRole = role.filter((role) => role_id === role.id);

            if (validRole.length === 0) {
                return res.status(400).json({ error: 'invalid role' });
            }
            const user = await userService.createUser({
                name: name,
                birth_date: birth_date,
                email: email,
                phone: phone,
                role_id: validRole[0].id,
                password_hash: hash,
            });
            console.log(user);
            //         if (user[0]) {
            //             const sendMessage = await userService.sendWhatsAppMessage(
            //                 user[0].phone,
            //                 `your email is : ${email}
            // and password is:
            // ${password}`
            //             );
            //             console.log(sendMessage);
            //         }
            const userData = await userService.removeHashedPassword(user[0]);
            res.status(201).json(userData);
        } catch (error) {
            res.status(400).json({ error: error.message, msg: 'bad data' });
        }
    },

    async getUser(req, res) {
        try {
            const user = await userService.getUser(req.params.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            const userData = await userService.removeHashedPassword(user);
            res.json(stripSensitive(userData));
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                        // 'users.id as id',
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
                        // 'users.id as id',
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
            if (!user[0])
                return res.status(404).json({ error: 'User not found' });

            const permissions = await roleService.getPermissionsOfRole(
                role[0].id
            );

            const fileterPermissions = await permissions.map((el) => el.name);

            res.json(stripSensitive({ user, permissions: fileterPermissions }));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(stripSensitive(users));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateUser(req, res) {
        try {
            const { name, email, phone, birth_date, role_id } = req.body;
            if (!role_id && !name && !email && !phone && !birth_date) {
                res.status(400).json({
                    msg: "role id can't be updated",
                });
                return;
            }
            const user = await userService.updateUser(req.params.id, req.body);
            if (!user || user.length == 0)
                return res.status(404).json({ error: 'User not found' });
            res.json(stripSensitive(user));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteUser(req, res) {
        try {
            const result = await userService.deleteUser(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'User not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async search(req, res) {
        try {
            const users = await userService.search(req.params.name);

            res.json(stripSensitive(users));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async paginate(req, res) {
        try {
            const users = await userService.paginate(req.body);
            res.json(stripSensitive(users));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getEmployees(req, res) {
        try {
            console.log('getEmployees');
            const emplyees = await userService.getEmployees();
            if (!emplyees)
                return res.status(404).json({ error: 'emplyees not found' });
            const formatted = emplyees.map((emp) => ({
                ...emp,
                birth_date: toDateOnly(emp.birth_date),
            }));
            res.status(200).json(stripSensitive(formatted));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async signOut(req, res) {
        try {
            const token =
                req.headers.authorization?.split(' ')[1] || req.headers.token;
            if (!token) {
                return res.status(400).json({ error: 'No token provided' });
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
            res.status(500).json({ error: error.message });
        }
    },
};
