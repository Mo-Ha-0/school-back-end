const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { teacherValidator } = require('../validators/teacherValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    teacherValidator,
    authMiddleware,
    hasPermission('manage_teachers'),
    teacherController.createTeacher
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_teachers'),
    teacherController.getAllTeachers
);
router.get(
    '/questions',
    authMiddleware,
    hasPermission('manage_exams'),
    teacherController.getQuestions
);
router.get(
    '/subjects',
    authMiddleware,
    hasPermission('manage_subjects'),
    teacherController.getSubjects
);

router.get(
    '/students',
    authMiddleware,
    hasPermission('manage_students'),
    teacherController.getStudents
);

router.get(
    '/schedule',
    authMiddleware,
    hasPermission('manage_schedules'),
    teacherController.getTeacherSchedule
);
router.get(
    '/classes',
    authMiddleware,
    hasPermission('manage_classes'),
    teacherController.getClassesByTeacher
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_teachers'),
    teacherController.getTeacher
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_teachers'),
    teacherController.updateTeacher
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_teachers'),
    teacherController.deleteTeacher
);

module.exports = router;
