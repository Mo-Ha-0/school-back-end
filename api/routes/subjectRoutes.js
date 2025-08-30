const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { subjectValidator } = require('../validators/subjectValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    subjectValidator,
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.createSubject
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.getAllSubjectes
);

router.get(
    '/list',
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.getSubjectsList
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.getSubject
);
router.put(
    '/:id',
    subjectValidator,
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.updateSubject
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_subjects'),
    subjectController.deleteSubject
);

module.exports = router;
