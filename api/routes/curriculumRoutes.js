const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { curriculumValidator } = require('../validators/curriculumValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    curriculumValidator,
    authMiddleware,
    hasPermission('manage_curriculums'),
    curriculumController.createCurriculum
);

router.get(
    '/',
    authMiddleware,
    hasPermission('manage_curriculums'),
    curriculumController.getAllCurriculums
);

router.get(
    '/:id',
    authMiddleware,
    // hasPermission('manage_curriculums'),
    curriculumController.getCurriculum
);

router.put(
    '/:id',
    authMiddleware,
    hasPermission('manage_curriculums'),
    curriculumController.updateCurriculum
);

router.delete(
    '/:id',
    authMiddleware,
    hasPermission('manage_curriculums'),
    curriculumController.deleteCurriculum
);

module.exports = router;
