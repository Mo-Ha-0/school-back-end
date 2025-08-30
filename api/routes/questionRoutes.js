const express = require('express');
const router = express.Router();
const questionContoller = require('../controllers/questionContoller');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { questionValidator } = require('../validators/questionValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    authMiddleware,
    hasPermission('manage_exams'),
    questionValidator,
    questionContoller.createQuestion
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_exams'),
    questionContoller.getAllQuestions
);
router.get(
    '/exam/:exam_id',
    authMiddleware,
    hasPermission('manage_exams'),
    questionContoller.getExamQuestions
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_exams'),
    questionContoller.getQuestion
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_exams'),
    questionContoller.updateQuestion
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_exams'),
    questionContoller.deleteQuestion
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
