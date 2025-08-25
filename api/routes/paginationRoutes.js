const express = require('express');
const router = express.Router();
const paginationController = require('../controllers/paginationController');
const authMiddleware = require('../../middleware/authMiddleware');
const hasPermission = require('../../middleware/hasPermission');
const { paginationValidator } = require('../validators/paginationValidator');

router.post(
    '/',
    paginationValidator,
    authMiddleware,
    hasPermission('get_students'),
    paginationController.paginateTable
);

module.exports = router;
