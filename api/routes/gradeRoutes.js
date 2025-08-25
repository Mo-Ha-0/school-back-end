const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { gradeValidator } = require('../validators/gradeValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    gradeValidator,
    authMiddleware,
    hasPermission('create_grade'),
    gradeController.createGrade
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_grades'),
    gradeController.getAllGrades
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_grade'),
    gradeController.getGrade
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_grade'),
    gradeController.updateGrade
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_grade'),
    gradeController.deleteGrade
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
