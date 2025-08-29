const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { behaviorValidator } = require('../validators/behaviorValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    behaviorValidator,
    authMiddleware,
    hasPermission('manage_behaviors'),
    behaviorController.createBehavior
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_behaviors'),
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
    // hasPermission('get_behaviors'),
    behaviorController.getBehavior
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_behaviors'),
    behaviorController.updateBehavior
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_behaviors'),
    behaviorController.deleteBehavior
);

module.exports = router;
