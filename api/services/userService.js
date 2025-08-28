const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
module.exports = {
    generateRandomPassword(length = 12) {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const randomBytes = crypto.randomBytes(length);
        let password = '';

        for (let i = 0; i < length; i++) {
            password += chars[randomBytes[i] % chars.length];
        }
        return password;
    },

    async removeHashedPassword(user) {
        if (!user) {
            return {};
        }
        const { password_hash, ...userData } = user;
        return userData;
    },
    async removeTimeStamp(user) {
        if (!user) {
            return {};
        }
        const { created_at, updated_at, ...userData } = user;
        return userData;
    },
    async createUser(userData, trx = null) {
        return await User.create(userData, trx);
    },

    async getUser(id) {
        return await User.findById(id);
    },

    async getUserByEmail(email) {
        return await User.findByEmail(email);
    },

    async sendWhatsAppMessage(to, body) {
        console.log(process.env.ULTRA_MSG_API_URL);
        try {
            const response = await axios.post(
                `${process.env.ULTRA_MSG_API_URL}/messages/chat`,
                {
                    token: process.env.ULTRA_MSG_TOKEN,
                    to: to,
                    body: body,
                }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(
                'Error sending message:',
                error.response?.data || error.message
            );
            throw error;
        }
    },

    async getAllUsers() {
        return await User.findAll();
    },

    async updateUser(id, updates) {
        return await User.update(id, updates);
    },

    async deleteUser(id) {
        return await User.delete(id);
    },

    async findUserWithRole(id) {
        return await User.findWithRole(id);
    },

    async search(name) {
        return await User.search(name);
    },
    async paginate({
        table,
        page = 1,
        pageSize = 10,
        orderBy = 'id',
        orderDirection = 'asc',
    }) {
        const totalResult = await User.count({ table });
        const total = parseInt(totalResult[0].total, 10);

        const data = await User.paginate({
            table,
            page,
            pageSize,
            orderBy,
            orderDirection,
        });
        const { password_hash, ...userData } = data;

        return {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            userData,
        };
    },

    async getEmployees() {
        return await User.getEmployees();
    },
};
