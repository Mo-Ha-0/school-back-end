// api/routes/tuitionPaymentRoutes.js
const express = require('express');
const router = express.Router();
// const tuitionPaymentController = require('../controllers/tuitionPaymentController');
// const {
//     createTuitionPaymentValidation,
//     updateTuitionPaymentValidation,
//     getPaymentValidation,
//     getStudentPaymentsValidation,
//     bulkCreatePaymentsValidation,
//     dateRangeValidation,
//     paymentStatsValidation,
//     getAllPaymentsValidation,
//     verifyPaymentValidation,
// } = require('../validators/tuitionPaymentValidator');

const hasPermission = require('../../middleware/hasPermission');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

// Create a new tuition payment
// router.post(
//     '/',
//     createTuitionPaymentValidation,
//     hasPermission('create_tuition_payment'),
//     tuitionPaymentController.createTuitionPayment
// );

// // Bulk create tuition payments
// router.post(
//     '/bulk',
//     bulkCreatePaymentsValidation,
//     hasPermission('create_tuition_payment'),
//     tuitionPaymentController.bulkCreatePayments
// );

// // Get all tuition payments with optional filters
// router.get(
//     '/',
//     getAllPaymentsValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getAllTuitionPayments
// );

// // Get payment statistics
// router.get(
//     '/stats',
//     paymentStatsValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getPaymentStats
// );

// // Get payments by date range
// router.get(
//     '/date-range',
//     dateRangeValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getPaymentsByDateRange
// );

// // Get outstanding payments
// router.get(
//     '/outstanding',
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getOutstandingPayments
// );

// // Get a specific tuition payment by ID
// router.get(
//     '/:id',
//     getPaymentValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getTuitionPayment
// );

// // Update a tuition payment
// router.put(
//     '/:id',
//     updateTuitionPaymentValidation,
//     hasPermission('update_tuition_payment'),
//     tuitionPaymentController.updateTuitionPayment
// );

// // Verify a payment
// router.patch(
//     '/:id/verify',
//     verifyPaymentValidation,
//     hasPermission('update_tuition_payment'),
//     tuitionPaymentController.verifyPayment
// );

// // Delete a tuition payment
// router.delete(
//     '/:id',
//     getPaymentValidation,
//     hasPermission('delete_tuition_payment'),
//     tuitionPaymentController.deleteTuitionPayment
// );

// // Get payments for a specific student
// router.get(
//     '/student/:student_id',
//     getStudentPaymentsValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getStudentPayments
// );

// // Get total payment amount for a specific student
// router.get(
//     '/student/:student_id/total',
//     getStudentPaymentsValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getStudentPaymentTotal
// );

// // Get student balance (paid, remaining, percentage)
// router.get(
//     '/student/:student_id/balance',
//     getStudentPaymentsValidation,
//     hasPermission('get_tuition_payments'),
//     tuitionPaymentController.getStudentBalance
// );

module.exports = router;
