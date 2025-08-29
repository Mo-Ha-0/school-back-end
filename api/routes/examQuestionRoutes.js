const express = require('express');
const router = express.Router();
const examQuestionController = require('../controllers/examQuestionController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { examValidator } = require('../validators/examValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    authMiddleware,
    hasPermission('manage_exams'),
    examQuestionController.createExamQuestion
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('manage_exams'),
    examQuestionController.getAllExamQuestions
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('manage_exams'),
    examQuestionController.getExamQuestion
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_exams'),
    examQuestionController.updateExamQuestion
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_exams'),
    examQuestionController.deleteExamQuestion
);

module.exports = router;
