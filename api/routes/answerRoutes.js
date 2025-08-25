const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { answerValidator } = require('../validators/answerValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    answerValidator,
    authMiddleware,
    hasPermission('create_answer'),
    answerController.createAnswer
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_answers'),
    answerController.getAllAnswers
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_answers'),
    answerController.getAnswer
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_answer'),
    answerController.updateAnswer
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_answer'),
    answerController.deleteAnswer
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
