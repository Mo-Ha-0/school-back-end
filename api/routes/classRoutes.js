const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { classValidator } = require('../validators/classValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    classValidator,
    authMiddleware,
    hasPermission('manage_classes'),
    classController.createClass
);
router.get(
    '/',
    authMiddleware,
    hasPermission(
        'manage_classes',
        'student_mobile_app',
        'attendance_mobile_app'
    ),
    classController.getAllClasses
);

router.get(
    '/students',
    authMiddleware,
    hasPermission(
        'manage_classes',
        'student_mobile_app',
        'attendance_mobile_app'
    ),
    classController.getStudentsInClass
);
router.get(
    '/grade_group',
    authMiddleware,
    hasPermission('manage_classes'),
    classController.getClassesGroupedByGrade
);
router.get(
    '/schedule',
    authMiddleware,
    hasPermission('manage_schedules'),
    classController.getClassSchedule
);
router.get(
    '/subjects-with-teachers/:id',
    authMiddleware,
    hasPermission('manage_schedules'),
    classController.getClassSubjectsWithTeachers
);

router.get(
    '/:id/can-delete',
    authMiddleware,
    hasPermission('manage_classes'),
    classController.canDeleteClass
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_classes'),
    classController.getClass
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_classes'),
    classController.updateClass
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_classes'),
    classController.deleteClass
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
