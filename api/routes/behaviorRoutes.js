const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');
const { behaviorValidator } = require('../validators/behaviorValidator');

router.post(
    '/',
    authMiddleware,
    hasPermission('create_behavior'),
    behaviorValidator,
    behaviorController.createBehavior
);

router.get(
    '/',
    authMiddleware,
    hasPermission('get_behaviors'),
    behaviorController.getAllBehaviors
);

router.get(
    '/me/list',
    authMiddleware,
    // hasPermission('get_student_behaviors'),
    behaviorController.getMyBehaviors
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_behaviors'),
    behaviorController.getBehavior
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_behavior'),
    behaviorController.updateBehavior
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_behavior'),
    behaviorController.deleteBehavior
);

module.exports = router;
