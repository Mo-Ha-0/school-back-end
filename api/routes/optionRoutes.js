const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { optionValidator } = require('../validators/optionValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    optionValidator,
    authMiddleware,
    hasPermission('manage_questions'),
    optionController.createOption
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_questions'),
    optionController.getAllOptions
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_questions'),
    optionController.getOption
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_questions'),
    optionController.updateOption
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_questions'),
    optionController.deleteOption
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
