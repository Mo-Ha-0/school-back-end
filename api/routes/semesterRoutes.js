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
    hasPermission('manage_academic_years'),
    semesterController.createSemester
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_academic_years'),
    semesterController.getAllSemesters
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_academic_years'),
    semesterController.getSemester
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_academic_years'),
    semesterController.updateSemester
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_academic_years'),
    semesterController.deleteSemester
);

module.exports = router;
