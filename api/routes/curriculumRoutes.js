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
    hasPermission('create_curriculum'),
    curriculumController.createCurriculum
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_curriculums'),
    curriculumController.getAllCurriculums
);
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_curriculums'),
    curriculumController.getCurriculum
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_curriculum'),
    curriculumController.updateCurriculum
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_curriculum'),
    curriculumController.deleteCurriculum
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
