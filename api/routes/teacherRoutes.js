const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const hasPermission = require('../../middleware/hasPermission');
const authMiddleware = require('../../middleware/authMiddleware');
const { teacherValidator } = require('../validators/teacherValidator');

router.post(
    '/',
    teacherValidator,
    authMiddleware,
    hasPermission('create_teacher'),
    teacherController.createTeacher
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_teachers'),
    teacherController.getAllTeachers
);
router.get(
    '/questions',
    authMiddleware,
    hasPermission('get_questions'),
    teacherController.getQuestions
);
router.get(
    '/subjects',
    authMiddleware,
    hasPermission('get_subjects'),
    teacherController.getSubjects
);
router.get(
    '/students',
    authMiddleware,
    hasPermission('get_students'),
    teacherController.getStudents
);
router.get(
    '/schedule',
    authMiddleware,
    hasPermission('get_schedules'),
    teacherController.getTeacherSchedule
);
router.get(
    '/classes',
    authMiddleware,
    hasPermission('get_classes'),
    teacherController.getClassesByTeacher
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_teachers'),
    teacherController.getTeacher
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_teacher'),
    teacherController.updateTeacher
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_teacher'),
    teacherController.deleteTeacher
);

module.exports = router;
