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
    hasPermission('manage_students'),
    studentController.createStudent
);

router.post(
    '/bulk-upload',
    authMiddleware,
    hasPermission('manage_students'),
    uploadMiddleware,
    studentController.createStudentsFromExcel
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.getAllStudents
);

// Search routes
router.get(
    '/search',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.searchStudents
);

router.post(
    '/search/advanced',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.searchStudentsAdvanced
);
router.get(
    '/scorecard',
    authMiddleware,
    hasPermission('view_student_profiles'),
    studentController.getStudentScoreCard
);
router.get(
    '/subjects',
    authMiddleware,
    hasPermission('manage_subjects'),
    studentController.getStudentSubjects
);
router.get(
    '/subjects-list',
    authMiddleware,
    hasPermission('manage_subjects'),
    studentController.getStudentSubjectsNameList
);

router.get(
    '/class/:classId',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.getStudentsByClass
);

router.get(
    '/class',
    authMiddleware,
    hasPermission('manage_classes'),
    studentController.getClass
);

router.get(
    '/schedule',
    authMiddleware,
    hasPermission('manage_schedules'),
    studentController.getStudentSchedule
);

router.get(
    '/archive',
    authMiddleware,
    hasPermission('manage_student_archives'),
    studentController.getStudentArchive
);

router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.getStudent
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.updateStudent
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    studentController.deleteStudent
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
