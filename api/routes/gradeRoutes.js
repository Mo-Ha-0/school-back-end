const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    gradeValidator,
    assignMarkValidator,
} = require('../validators/gradeValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    gradeValidator,
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.createGrade
);

router.post(
    '/assign-mark',
    assignMarkValidator,
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.assignMark
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.getAllGrades
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.getGrade
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.updateGrade
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_grades'),
    gradeController.deleteGrade
);

module.exports = router;
