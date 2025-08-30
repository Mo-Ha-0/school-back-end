const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const studentController = require('../controllers/studentController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { archiveValidator } = require('../validators/archiveValidaor');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    archiveValidator,
    authMiddleware,
    hasPermission('manage_students'),
    archiveController.createArchive
);
router.get(
    '/',
    authMiddleware,
    hasPermission('manage_students'),
    archiveController.getAllArchives
);
router.get(
    '/scorecard',
    authMiddleware,
    // hasPermission('get_student_scorecard'),
    studentController.getStudentScoreCardFromArchive
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    archiveController.getArchive
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    archiveController.updateArchive
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_students'),
    archiveController.deleteArchive
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
