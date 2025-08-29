// api/routes/tuitionPaymentRoutes.js
const express = require('express');
const router = express.Router();
const tuitionPaymentController = require('../controllers/tuitionPaymentController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    createTuitionPaymentValidation,
    updateTuitionPaymentValidation,
    getPaymentValidation,
    getStudentPaymentsValidation,
    bulkCreatePaymentsValidation,
    dateRangeValidation,
    paymentStatsValidation,
    getAllPaymentsValidation,
    verifyPaymentValidation,
} = require('../validators/tuitionPaymentValidator');

const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    createTuitionPaymentValidation,
    authMiddleware,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.createTuitionPayment
);

// Bulk create tuition payments
router.post(
    '/bulk',
    bulkCreatePaymentsValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.bulkCreatePayments
);

// Get all tuition payments with optional filters
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getAllTuitionPayments
);

// Get payment statistics
router.get(
    '/stats',
    paymentStatsValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getPaymentStats
);

// Get payments by date range
router.get(
    '/date-range',
    dateRangeValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getPaymentsByDateRange
);

// Get outstanding payments
router.post(
    '/outstanding',
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getOutstandingPayments
);

// Get a specific tuition payment by ID
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getTuitionPayment
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.updateTuitionPayment
);

// Verify a payment
router.patch(
    '/:id/verify',
    verifyPaymentValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.verifyPayment
);

// Delete a tuition payment
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.deleteTuitionPayment
);

router.get(
    '/student/:student_id',
    getStudentPaymentsValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getStudentPayments
);

// Get total payment amount for a specific student
router.get(
    '/student/:student_id/total',
    getStudentPaymentsValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getStudentPaymentTotal
);

// Get student balance (paid, remaining, percentage)
router.get(
    '/student/:student_id/balance',
    getStudentPaymentsValidation,
    hasPermission('manage_tuition_payments'),
    tuitionPaymentController.getStudentBalance
);

module.exports = router;
