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
    // hasPermission('get_questions'),
    teacherController.getQuestions
);
router.get(
    '/subjects',
    authMiddleware,
    // hasPermission('get_subjectsman'),
    teacherController.getSubjects
);

router.get(
    '/students',
    authMiddleware,
    // hasPermission('get_students'),
    teacherController.getStudents
);

router.get(
    '/schedule',
    authMiddleware,
    hasPermission('view_teacher_schedules'),
    teacherController.getTeacherSchedule
);
router.get(
    '/classes',
    authMiddleware,
    // hasPermission('get_classes'),
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
