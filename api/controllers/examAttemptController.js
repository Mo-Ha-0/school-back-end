const examAttemptService = require('../services/examAttemptService');
const examService = require('../services/examService');
const answerService = require('../services/answerService');
const studentService = require('../services/studentService');
const gradeService = require('../services/gradeService');
const academicYearService = require('../services/academicYearService');
const archiveService = require('../services/archiveService');
const semesterService = require('../services/semesterService');
const { validationResult } = require('express-validator');

module.exports = {
    async createExamAttempt(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const ExamAttempt = await examAttemptService.createExamAttempt(
                req.body
            );
            res.status(201).json(ExamAttempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getExamAttempt(req, res) {
        try {
            const ExamAttempt = await examAttemptService.getExamAttempt(
                req.params.id
            );
            if (!ExamAttempt)
                return res
                    .status(404)
                    .json({ error: 'Exam Attempt not found' });
            res.json(ExamAttempt);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllExamAttempts(req, res) {
        try {
            const ExamAttempts = await examAttemptService.getAllExamAttempts();
            res.json(ExamAttempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateExamAttempt(req, res) {
        try {
            const ExamAttempt = await examAttemptService.updateExamAttempt(
                req.params.id,
                req.body
            );
            if (!ExamAttempt || ExamAttempt.length == 0)
                return res
                    .status(404)
                    .json({ error: 'Exam Attempt not found' });
            res.json(ExamAttempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteExamAttempt(req, res) {
        try {
            const result = await examAttemptService.deleteExamAttempt(
                req.params.id
            );
            if (!result)
                return res
                    .status(404)
                    .json({ error: 'Exam Attempt not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Grade entire exam
    async gradeExam(req, res) {
        // Get the Knex instance (usually from your app setup)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { db } = require('../../config/db');

        let trx;
        try {
            const { exam_id, email, answers } = req.body;

            // Validate required fields
            if (!exam_id || !email || !answers) {
                return res
                    .status(400)
                    .json({ error: 'Missing required fields' });
            }

            // Start transaction
            trx = await db.transaction();

            const student = await studentService.findByEmail(email, trx);

            const existingAttempt =
                await examAttemptService.checkIfStudentTakeAnExam(
                    student.id,
                    exam_id
                );

            console.log(existingAttempt);
            if (existingAttempt) {
                await trx.rollback();
                return res.status(400).json({
                    error: 'You have already taken this exam',
                    previous_score: existingAttempt.score,
                    previous_attempt_id: existingAttempt.id,
                });
            }

            const examAttempt = await examAttemptService.createExamAttempt(
                {
                    exam_id: exam_id,
                    student_id: student.id,
                },
                trx
            );

            const attempt_id = examAttempt[0].id;
            const exam = await examService.getExamQuestion(exam_id, trx);

            if (!exam) {
                await trx.rollback();
                return res.status(404).json({ error: 'Exam not found' });
            }

            let totalScore = 0;
            const results = [];
            const answersMap = new Map(
                answers.map((answer) => [answer.question_id, answer])
            );

            // Process each question with transaction support
            for (const question of exam.questions) {
                try {
                    const studentAnswer = answersMap.get(question.question_id);
                    const correctOption = question.options.find(
                        (opt) => opt.is_correct
                    );

                    if (!studentAnswer) {
                        results.push({
                            questionId: question.question_id,
                            is_correct: false,
                            mark_awarded: 0,
                            feedback: 'No answer provided',
                        });
                        continue;
                    }

                    let gradingResult;

                    switch (question.type) {
                        case 'mcq':
                            if (!studentAnswer.option_id) {
                                throw new Error(
                                    'Missing option_id for MCQ question'
                                );
                            }
                            gradingResult = await answerService.createAnswer(
                                {
                                    question_id: question.question_id,
                                    exam_attempt_id: attempt_id,
                                    option_id: studentAnswer.option_id,
                                },
                                trx
                            );
                            break;
                        default:
                            gradingResult = [
                                {
                                    is_correct: false,
                                    mark_awarded: 0,
                                    feedback:
                                        'This question type cannot be auto-graded',
                                },
                            ];
                    }

                    const isCorrect =
                        studentAnswer.option_id === correctOption?.option_id;
                    totalScore += gradingResult[0].mark_awarded || 0;

                    results.push({
                        feedback: isCorrect
                            ? 'Correct!'
                            : `The correct answer was: ${correctOption?.text}`,
                        ...gradingResult[0],
                    });
                } catch (questionError) {
                    console.error(
                        `Error processing question ${question.question_id}:`,
                        questionError
                    );
                    results.push({
                        questionId: question.question_id,
                        is_correct: false,
                        mark_awarded: 0,
                        feedback: 'Error processing question',
                        error: questionError.message,
                    });
                }
            }

            // Update attempt with final score
            await examAttemptService.updateExamAttempt(
                attempt_id,
                { score: totalScore },
                trx
            );

            const academicYear =
                await academicYearService.findAllAccordingYearNow();

            const semester = await semesterService.findByAcademicYearId(
                academicYear.id
            );
            const archive = await archiveService.findByAcademicYearId(
                academicYear.id,
                student.id
            );
            console.log(exam);
            const grade = await gradeService.createGrade(
                {
                    archive_id: archive.id,
                    semester_id: semester.id,
                    subject_id: exam.subject_id,
                    min_score: exam.passing_mark,
                    max_score: exam.total_mark,
                    grade: totalScore,
                    type: exam.exam_type,
                },
                trx
            );
            console.log(academicYear, semester, archive);
            console.log('grade', grade);
            // Commit the transaction if everything succeededs
            await trx.commit();

            res.json({
                total_mark: exam.total_mark,
                totalScore,
                passingScore: exam.passing_mark,
                passed: totalScore >= exam.passing_mark,
                results,
            });
        } catch (error) {
            // Rollback transaction if any error occurs
            if (trx) await trx.rollback();

            console.error('Error in gradeExam:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
            });
        }
    },
};
