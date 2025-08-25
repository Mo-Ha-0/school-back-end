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
    hasPermission('create_calss'),
    classController.createClass
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_classes'),
    classController.getAllClasses
);

router.get(
    '/students',
    authMiddleware,
    hasPermission('get_students'),
    classController.getStudentsInClass
);
router.get(
    '/grade_group',
    authMiddleware,
    hasPermission('get_classes'),
    classController.getClassesGroupedByGrade
);
router.get(
    '/schedule',
    authMiddleware,
    hasPermission('get_schedules'),
    classController.getClassSchedule
);
router.get(
    '/subjects-with-teachers/:id',
    authMiddleware,
    hasPermission('create_schedule', 'update_schedule'),
    classController.getClassSubjectsWithTeachers
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_classes'),
    classController.getClass
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_class'),
    classController.updateClass
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_class'),
    classController.deleteClass
);

router.get(
    '/:id/can-delete',
    authMiddleware,
    hasPermission('delete_class'),
    classController.canDeleteClass
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
