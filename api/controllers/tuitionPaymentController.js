// api/controllers/tuitionPaymentController.js
const tuitionPaymentService = require('../services/tuitionPaymentService');
const { validationResult } = require('express-validator');
const { db } = require('../../config/db');

module.exports = {
    async createTuitionPayment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tuitionPayment =
                await tuitionPaymentService.createTuitionPayment(req.body);
            res.status(201).json(tuitionPayment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getTuitionPayment(req, res) {
        try {
            const tuitionPayment =
                await tuitionPaymentService.getTuitionPayment(req.params.id);
            if (!tuitionPayment) {
                return res
                    .status(404)
                    .json({ error: 'Tuition payment not found' });
            }
            res.json(tuitionPayment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllTuitionPayments(req, res) {
        try {
            const filters = {
                student_id: req.query.student_id,
                payment_method: req.query.payment_method,
                date_from: req.query.date_from,
                date_to: req.query.date_to,
            };

            const tuitionPayments =
                await tuitionPaymentService.getAllTuitionPayments(filters);
            res.json(tuitionPayments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateTuitionPayment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tuitionPayment =
                await tuitionPaymentService.updateTuitionPayment(
                    req.params.id,
                    req.body
                );
            if (!tuitionPayment) {
                return res
                    .status(404)
                    .json({ error: 'Tuition payment not found' });
            }
            res.json(tuitionPayment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteTuitionPayment(req, res) {
        try {
            const result = await tuitionPaymentService.deleteTuitionPayment(
                req.params.id
            );
            if (!result) {
                return res
                    .status(404)
                    .json({ error: 'Tuition payment not found' });
            }
            res.status(200).json({ message: 'deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStudentPayments(req, res) {
        try {
            const { student_id } = req.params;
            const payments = await tuitionPaymentService.getPaymentsByStudent(
                student_id
            );
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStudentPaymentTotal(req, res) {
        try {
            const { student_id } = req.params;
            const total = await tuitionPaymentService.getTotalAmountByStudent(
                student_id
            );
            res.json({ student_id, total_paid: total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getPaymentStats(req, res) {
        try {
            const filters = {
                date_from: req.query.date_from,
                date_to: req.query.date_to,
            };

            const stats = await tuitionPaymentService.getPaymentStats(filters);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async verifyPayment(req, res) {
        try {
            const { id } = req.params;
            const verifierId = req.user.id;

            const payment = await tuitionPaymentService.verifyPayment(
                id,
                verifierId
            );
            if (!payment) {
                return res
                    .status(404)
                    .json({ error: 'Tuition payment not found' });
            }
            res.json(payment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getStudentBalance(req, res) {
        try {
            const { student_id } = req.params;
            const balance = await tuitionPaymentService.getStudentBalance(
                student_id
            );
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async bulkCreatePayments(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { payments } = req.body;
            const results = await tuitionPaymentService.bulkCreatePayments(
                payments
            );
            res.status(201).json(results);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getPaymentsByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            if (!start_date || !end_date) {
                return res
                    .status(400)
                    .json({ error: 'start_date and end_date are required' });
            }

            const payments = await tuitionPaymentService.getPaymentsByDateRange(
                start_date,
                end_date
            );
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOutstandingPayments(req, res) {
        try {
            const outstandingPayments =
                await tuitionPaymentService.getOutstandingPayments();
            res.json(outstandingPayments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
