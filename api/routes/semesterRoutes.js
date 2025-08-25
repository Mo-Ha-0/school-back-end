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
    hasPermission('create_semester'),
    semesterController.createSemester
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_semesters'),
    semesterController.getAllSemesters
);

// router.get('/students', academicYearController.getStudentsInClass);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_semesters'),
    semesterController.getSemester
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_semester'),
    semesterController.updateSemester
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_semester'),
    semesterController.deleteSemester
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
