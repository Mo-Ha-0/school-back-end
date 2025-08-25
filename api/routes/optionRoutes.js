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
    hasPermission('create_option'),
    optionController.createOption
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_options'),
    optionController.getAllOptions
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_options'),
    optionController.getOption
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_option'),
    optionController.updateOption
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_option'),
    optionController.deleteOption
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
