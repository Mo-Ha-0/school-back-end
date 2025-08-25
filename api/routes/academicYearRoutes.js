const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const {
  academicYearValidator,
} = require('../validators/academicYearValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
  '/',
  academicYearValidator,
  authMiddleware,
  hasPermission('create_academic_year'),
  academicYearController.createAcademicYear
);
router.get(
  '/',
  authMiddleware,
  hasPermission('get_academic_years'),
  academicYearController.getAllAcademicYeares
);
// router.get('/students', academicYearController.getStudentsInClass);
router.get(
  '/:id',
  authMiddleware,
  hasPermission('get_academic_years'),
  academicYearController.getAcademicYear
);
router.put(
  '/:id',
  authMiddleware,
  hasPermission('update_academic_year'),
  academicYearController.updateAcademicYear
);
router.delete(
  '/:id',
  authMiddleware,
  hasPermission('delete_academic_year'),
  academicYearController.deleteAcademicYear
);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
