const express = require('express');
const router = express.Router();
const examAttemptController = require('../controllers/examAttemptController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { examAttemptValidator } = require('../validators/examAttemptValidator');
const { examCorrectValidator } = require('../validators/examCorrectValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    examAttemptValidator,
    authMiddleware,
    hasPermission('manage_exam_attempts'),
    examAttemptController.createExamAttempt
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('manage_exam_attempts'),
    examAttemptController.getAllExamAttempts
);

router.get(
    '/check',
    authMiddleware,
    examCorrectValidator,
    examAttemptController.gradeExam
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_exam_attempts'),
    examAttemptController.getAllExamAttempts
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_exam_attempts'),
    examAttemptController.updateExamAttempt
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_exam_attempts'),
    examAttemptController.deleteExamAttempt
);

module.exports = router;
