const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { semesterValidator } = require('../validators/semesterValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    semesterValidator,
    authMiddleware,
    hasPermission('manage_semesters'),
    semesterController.createSemester
);

router.get(
    '/',
    authMiddleware,
    // hasPermission('get_semesters'),
    semesterController.getAllSemesters
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('get_semesters'),
    semesterController.getSemester
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_semesters'),
    semesterController.updateSemester
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_semesters'),
    semesterController.deleteSemester
);

module.exports = router;
