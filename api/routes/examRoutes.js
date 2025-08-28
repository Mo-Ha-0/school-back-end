const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { checkRoles } = require('../../middleware/roleMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const { examValidator } = require('../validators/examValidator');
const hasPermission = require('../../middleware/hasPermission');

router.post(
    '/',
    examValidator,
    authMiddleware,
    hasPermission('create_exam'),
    examController.createExamWithQuestions
);
router.get(
    '/',
    authMiddleware,
    hasPermission('get_exams'),
    examController.getAllExams
);
router.get(
    '/student-preexams',
    authMiddleware,
    hasPermission('get_preexams'),
    examController.getAllPreExamsForSemester
);
router.get(
    '/student-prequizzes',
    authMiddleware,
    hasPermission('get_preexams'),
    examController.getAllPreQuizzesForSemester
);
router.get(
    '/student-nextexams',
    authMiddleware,
    hasPermission('get_next_exams'),
    examController.getUpComingExam
);
router.get(
    '/student-nextquizzes',
    authMiddleware,
    hasPermission('get_next_exams'),
    examController.getUpComingQuiz
);
router.get(
    '/subject/:subject_id/semesters',
    authMiddleware,
    hasPermission('get_preexams'),
    examController.getsemestersBySubjectForPreExam
);
router.get(
    '/subject/:subject_id/quiz-semesters',
    authMiddleware,
    hasPermission('get_preexams'),
    examController.getsemestersBySubjectForPreQuiz
);
router.get(
    '/questions',
    authMiddleware,
    hasPermission('get_exam_questions'),
    examController.getExamQuestion
);
// router.get(
//     '/:id/questions_and_answers',
//     authMiddleware,
//     hasPermission('get_exam_questions'),
//     examController.getExamQuestionsWithAnswers
// );
router.get(
    '/:id',
    authMiddleware,
    hasPermission('get_exams'),
    examController.getExam
);
router.put(
    '/:id',
    authMiddleware,
    hasPermission('update_exam'),
    examController.updateExam
);
router.delete(
    '/:id',
    authMiddleware,
    hasPermission('delete_exam'),
    examController.deleteExam
);

// Quiz-specific public routes (no authentication middleware needed)
router.post('/quiz/authenticate', examController.authenticateQuizAccess);

router.get('/quiz/:quizId/data', examController.getQuizData);

router.post('/quiz/:quizId/submit', examController.submitQuizAnswers);

//authMiddleware,checkRoles(['admin']),
module.exports = router;
