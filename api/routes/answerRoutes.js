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
    hasPermission('manage_questions'),
    answerController.createAnswer
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('manage_questions'),
    answerController.getAllAnswers
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('manage_questions'),
    answerController.getAnswer
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_questions'),
    answerController.updateAnswer
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_questions'),
    answerController.deleteAnswer
);

module.exports = router;
