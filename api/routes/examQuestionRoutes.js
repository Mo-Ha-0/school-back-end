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
    hasPermission('create_exam_question'),
    examQuestionController.createExamQuestion
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_exam_questions'),
    examQuestionController.getAllExamQuestions
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_exam_questions'),
    examQuestionController.getExamQuestion
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_exam_question'),
    examQuestionController.updateExamQuestion
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_exam_question'),
    examQuestionController.deleteExamQuestion
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
