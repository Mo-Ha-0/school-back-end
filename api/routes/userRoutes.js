const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body, validationResult } = require('express-validator');
const { UserValidator } = require('../validators/userValidator');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');

router.post('/signin', userController.signIn);
router.post('/signout', authMiddleware, userController.signOut);
router.post(
    '/',
    UserValidator,
    authMiddleware,
    hasPermission('manage_users'),
    userController.createUser
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('get_users'),
    userController.getAllUsers
);
router.get(
    '/employees',
    authMiddleware,
    hasPermission('manage_users'),
    userController.getEmployees
);
router.get(
    '/search/:name',
    authMiddleware,
    hasPermission('manage_users'),
    userController.search
);
router.get(
    '/paginate',
    authMiddleware,
    hasPermission('manage_users'),
    userController.paginate
);

router.get('/current-user', authMiddleware, userController.getUserByToken);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_users'),
    userController.getUser
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_users'),
    userController.updateUser
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_users'),
    userController.deleteUser
);

module.exports = router;
