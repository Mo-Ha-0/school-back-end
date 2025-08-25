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
    // hasPermission('create_exam_attempt'),
    examAttemptController.createExamAttempt
);
router.get(
    '/',
    authMiddleware,
    // hasPermission('get_exam_attempts'),
    examAttemptController.getAllExamAttempts
);
router.get(
    '/check',
    authMiddleware,
    // hasPermission('grade_exam'),
    examCorrectValidator,
    examAttemptController.gradeExam
);
router.get(
    '/:id',
    authMiddleware,
    // hasPermission('get_exam_attempts'),
    examAttemptController.getAllExamAttempts
);
router.put(
    '/:id',
    authMiddleware,
    // hasPermission('update_exam_attempt'),
    examAttemptController.updateExamAttempt
);
router.delete(
    '/:id',
    authMiddleware,
    // hasPermission('delete_exam_attempt'),
    examAttemptController.deleteExamAttempt
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
