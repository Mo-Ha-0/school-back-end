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
    hasPermission('create_question'),
    questionValidator,
    questionContoller.createQuestion
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_questions'),
    questionContoller.getAllQuestions
);
router.get(
    '/exam/:exam_id',
    authMiddleware,
    hasPermission('get_questions'),
    questionContoller.getExamQuestions
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_questions'),
    questionContoller.getQuestion
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_question'),
    questionContoller.updateQuestion
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_question'),
    questionContoller.deleteQuestion
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
