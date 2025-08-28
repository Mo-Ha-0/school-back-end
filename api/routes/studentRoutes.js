const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { studentValidator } = require('../validators/studentValidator');
const hasPermission = require('../../middleware/hasPermission');
const { uploadMiddleware } = require('../../middleware/uploadMiddleware');

router.post(
    '/',
    studentValidator,
    authMiddleware,
    hasPermission('create_student'),
    studentController.createStudent
);

router.post(
    '/bulk-upload',
    authMiddleware,
    hasPermission('create_student'),
    uploadMiddleware,
    studentController.createStudentsFromExcel
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_students'),
    studentController.getAllStudents
);

// Search routes
router.get(
    '/search',
    authMiddleware,
    hasPermission('get_students'),
    studentController.searchStudents
);

router.get(
    '/search/advanced',
    authMiddleware,
    hasPermission('get_students'),
    studentController.searchStudentsAdvanced
);
router.get(
    '/scorecard',
    authMiddleware,
    // hasPermission('get_student_scorecard'),
    studentController.getStudentScoreCard
);
router.get(
    '/subjects',
    authMiddleware,
    hasPermission('get_subjects'),
    studentController.getStudentSubjects
);
router.get(
    '/subjects-list',
    authMiddleware,
    hasPermission('get_subjects'),
    studentController.getStudentSubjectsNameList
);

router.get(
    '/class/:classId',
    authMiddleware,
    hasPermission('get_students'),
    studentController.getStudentsByClass
);

router.get(
    '/class',
    authMiddleware,
    hasPermission('get_classes'),
    studentController.getClass
);

router.get(
    '/schedule',
    authMiddleware,
    hasPermission('get_schedules'),
    studentController.getStudentSchedule
);

router.get(
    '/archive',
    authMiddleware,
    hasPermission('get_archives'),
    studentController.getStudentArchive
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_students'),
    studentController.getStudent
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_student'),
    studentController.updateStudent
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_student'),
    studentController.deleteStudent
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
