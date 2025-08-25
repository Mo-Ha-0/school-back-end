// api/validators/tuitionPaymentValidator.js
const { body, param, query } = require('express-validator');

const createTuitionPaymentValidation = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number')
        .custom((value) => {
            if (value > 999999.99) {
                throw new Error('Amount cannot exceed 999,999.99');
            }
            return true;
        }),

    body('payment_date')
        .isISO8601()
        .withMessage('Payment date must be a valid date')
        .custom((value) => {
            const paymentDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            if (paymentDate > today) {
                throw new Error('Payment date cannot be in the future');
            }
            return true;
        }),

    body('payment_method')
        .isIn(['cash', 'bank_transfer'])
        .withMessage('Payment method must be either cash or bank_transfer'),

    body('student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),

    body('verified_by')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Verified by must be a positive integer'),

    // archive_id optional; if omitted back-end will find current archive
    body('archive_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Archive ID must be a positive integer'),
];

const updateTuitionPaymentValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Payment ID must be a positive integer'),

    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number')
        .custom((value) => {
            if (value && value > 999999.99) {
                throw new Error('Amount cannot exceed 999,999.99');
            }
            return true;
        }),

    body('payment_date')
        .optional()
        .isISO8601()
        .withMessage('Payment date must be a valid date')
        .custom((value) => {
            if (value) {
                const paymentDate = new Date(value);
                const today = new Date();
                today.setHours(23, 59, 59, 999);

                if (paymentDate > today) {
                    throw new Error('Payment date cannot be in the future');
                }
            }
            return true;
        }),

    body('payment_method')
        .optional()
        .isIn(['cash', 'bank_transfer'])
        .withMessage('Payment method must be either cash or bank_transfer'),

    body('student_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),

    body('verified_by')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Verified by must be a positive integer'),

    body('archive_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Archive ID must be a positive integer'),
];

const getPaymentValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Payment ID must be a positive integer'),
];

const getStudentPaymentsValidation = [
    param('student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
];

const bulkCreatePaymentsValidation = [
    body('payments')
        .isArray({ min: 1 })
        .withMessage('Payments must be a non-empty array'),

    body('payments.*.amount')
        .isFloat({ min: 0.01 })
        .withMessage('Each payment amount must be a positive number')
        .custom((value) => {
            if (value > 999999.99) {
                throw new Error('Amount cannot exceed 999,999.99');
            }
            return true;
        }),

    body('payments.*.payment_date')
        .isISO8601()
        .withMessage('Each payment date must be a valid date')
        .custom((value) => {
            const paymentDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (paymentDate > today) {
                throw new Error('Payment date cannot be in the future');
            }
            return true;
        }),

    body('payments.*.payment_method')
        .isIn(['cash', 'bank_transfer'])
        .withMessage(
            'Each payment method must be either cash or bank_transfer'
        ),

    body('payments.*.student_id')
        .isInt({ min: 1 })
        .withMessage('Each student ID must be a positive integer'),

    body('payments.*.verified_by')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Verified by must be a positive integer'),

    body('payments.*.archive_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Archive ID must be a positive integer'),
];

const dateRangeValidation = [
    query('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    query('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            const startDate = new Date(req.query.start_date);
            const endDate = new Date(value);

            if (endDate < startDate) {
                throw new Error('End date must be after start date');
            }

            const daysDifference =
                (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (daysDifference > 365) {
                throw new Error('Date range cannot exceed 365 days');
            }

            return true;
        }),
];

const paymentStatsValidation = [
    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid date'),

    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid date')
        .custom((value, { req }) => {
            if (value && req.query.date_from) {
                const fromDate = new Date(req.query.date_from);
                const toDate = new Date(value);

                if (toDate < fromDate) {
                    throw new Error('Date to must be after date from');
                }
            }
            return true;
        }),
];

const getAllPaymentsValidation = [
    query('student_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),

    query('payment_method')
        .optional()
        .isIn(['cash', 'bank_transfer'])
        .withMessage('Payment method must be either cash or bank_transfer'),

    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid date'),

    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid date')
        .custom((value, { req }) => {
            if (value && req.query.date_from) {
                const fromDate = new Date(req.query.date_from);
                const toDate = new Date(value);

                if (toDate < fromDate) {
                    throw new Error('Date to must be after date from');
                }
            }
            return true;
        }),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];

const verifyPaymentValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Payment ID must be a positive integer'),
];

module.exports = {
    createTuitionPaymentValidation,
    updateTuitionPaymentValidation,
    getPaymentValidation,
    getStudentPaymentsValidation,
    bulkCreatePaymentsValidation,
    dateRangeValidation,
    paymentStatsValidation,
    getAllPaymentsValidation,
    verifyPaymentValidation,
};
