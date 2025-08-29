const examService = require('../services/examService');
const examQuestionService = require('../services/examQuestionService');
const { validationResult } = require('express-validator');
const { db } = require('../../config/db');
const bcrypt = require('bcrypt');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

module.exports = {
    async createExamWithQuestions(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json(handleValidationErrors(errors));
        }

        const trx = await db.transaction();

        try {
            // 1. First create the exam
            const examData = {
                subject_id: req.body.subject_id,
                semester_id: req.body.semester_id,
                title: req.body.title,
                description: req.body.description,
                time_limit: req.body.time_limit,
                total_mark: req.body.total_mark,
                passing_mark: req.body.passing_mark,
                start_datetime: req.body.start_datetime,
                end_datetime: req.body.end_datetime,
                announced: req.body.announced || false,
                exam_type: req.body.exam_type || 'exam',
            };

            const exam = await examService.createExam(examData, trx);

            // 2. Then create exam questions
            const questions = req.body.questions || [];
            const questionResults = [];

            for (const question of questions) {
                const examQuestion =
                    await examQuestionService.createExamQuestion(
                        {
                            question_id: question.question_id,
                            mark: question.mark,
                            exam_id: exam[0].id,
                        },
                        trx
                    );

                questionResults.push(examQuestion[0]);
            }

            await trx.commit();

            // 3. Return combined response
            res.status(HTTP_STATUS.CREATED).json({
                exam: exam[0],
                questions: questionResults,
            });
        } catch (error) {
            await handleTransactionError(
                trx,
                error,
                'Create exam with questions'
            );

            logError('Create exam with questions failed', error, {
                subject_id: req.body.subject_id,
                semester_id: req.body.semester_id,
                createdBy: req.user?.id,
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create exam with questions.',
                    null,
                    'CREATE_EXAM_ERROR'
                )
            );
        }
    },

    async getExam(req, res) {
        try {
            const Exam = await examService.getExam(req.params.id);
            if (!Exam) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam not found.',
                            null,
                            'EXAM_NOT_FOUND'
                        )
                    );
            }
            res.json(Exam);
        } catch (error) {
            logError('Get exam failed', error, { examId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exam.',
                    null,
                    'GET_EXAM_ERROR'
                )
            );
        }
    },

    async getAllExams(req, res) {
        try {
            const Exams = await examService.getAllExams();
            res.json(Exams);
        } catch (error) {
            logError('Get all exams failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exams.',
                    null,
                    'GET_EXAMS_ERROR'
                )
            );
        }
    },

    async updateExam(req, res) {
        try {
            const Exam = await examService.updateExam(req.params.id, req.body);
            if (!Exam || Exam.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam not found.',
                            null,
                            'EXAM_NOT_FOUND'
                        )
                    );
            }
            res.json(Exam);
        } catch (error) {
            logError('Update exam failed', error, { examId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update exam.',
                    null,
                    'UPDATE_EXAM_ERROR'
                )
            );
        }
    },

    async deleteExam(req, res) {
        try {
            const result = await examService.deleteExam(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam not found.',
                            null,
                            'EXAM_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Exam deleted successfully',
            });
        } catch (error) {
            logError('Delete exam failed', error, { examId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete exam.',
                    null,
                    'DELETE_EXAM_ERROR'
                )
            );
        }
    },

    async getExamQuestion(req, res) {
        try {
            const Exam = await examService.getExam(req.body.id);
            if (!Exam) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam not found.',
                            null,
                            'EXAM_NOT_FOUND'
                        )
                    );
            }
            const result = await examService.getExamQuestion(req.body.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Exam questions not found.',
                            null,
                            'EXAM_QUESTIONS_NOT_FOUND'
                        )
                    );
            }
            res.json(result);
        } catch (error) {
            logError('Get exam questions failed', error, {
                examId: req.body.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve exam questions.',
                    null,
                    'GET_EXAM_QUESTIONS_ERROR'
                )
            );
        }
    },

    async getAllPreExamsForSemester(req, res) {
        try {
            const userId = req.user.id;
            const { subjectId, semesterId } = req.body;
            const Exams = await db('exams')
                .select(
                    'id',
                    'uuid',
                    'subject_id',
                    'title',
                    'description',
                    'time_limit',
                    'total_mark',
                    'passing_mark',
                    'start_datetime',
                    'end_datetime',
                    'semester_id'
                )
                .where({ subject_id: subjectId, semester_id: semesterId })
                .andWhere('exam_type', 'exam');
            res.json(Exams);
        } catch (error) {
            logError('Get pre-exams for semester failed', error, {
                subjectId,
                semesterId,
                userId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve pre-exams for semester.',
                    null,
                    'GET_PRE_EXAMS_ERROR'
                )
            );
        }
    },

    async getsemestersBySubjectForPreExam(req, res) {
        const { subject_id } = req.params;
        const userId = req.user.id;
        try {
            const examExists = await db('exams')
                .where({ subject_id })
                .andWhere('exam_type', 'exam')
                .first();
            if (!examExists) {
                return res.json('There are no exams for this subject');
            }

            const student = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!student) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Student record not found for this user.',
                            null,
                            'STUDENT_NOT_FOUND'
                        )
                    );
            }

            const subject = await db('subjects')
                .select('curriculum_id')
                .where({ id: subject_id })
                .first();

            if (!subject) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Subject not found.',
                            null,
                            'SUBJECT_NOT_FOUND'
                        )
                    );
            }

            if (student.curriculum_id !== subject.curriculum_id) {
                return res
                    .status(HTTP_STATUS.FORBIDDEN)
                    .json(
                        createErrorResponse(
                            'Student curriculum does not match subject curriculum.',
                            null,
                            'CURRICULUM_MISMATCH'
                        )
                    );
            }

            const semesters = await db('exams')
                .join('semesters', 'semesters.id', 'exams.semester_id')
                .join(
                    'academic_years',
                    'academic_years.id',
                    'semesters.academic_year_id'
                )
                // .distinct('semesters.id', 'semesters.semester_name')
                .where('exams.subject_id', subject_id)
                .where('exams.announced', true)
                .where('exams.end_datetime', '<=', db.fn.now())
                .andWhere('exams.exam_type', 'exam')
                .select(
                    'semesters.id as semesters_id',
                    'semesters.semester_name',
                    'semesters.academic_year_id',
                    db.raw(`
                    CONCAT(
                        EXTRACT(YEAR FROM academic_years.start_year)::text, 
                        '-', 
                        EXTRACT(YEAR FROM academic_years.end_year)::text
                    ) AS year
                    `)
                );

            if (semesters.length === 0) {
                return res.json([]);
            }

            res.json(semesters);
        } catch (error) {
            logError('Get semesters by subject for pre-exam failed', error, {
                subject_id,
                userId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve semesters for pre-exam.',
                    null,
                    'GET_SEMESTERS_ERROR'
                )
            );
        }
    },

    async getUpComingExam(req, res) {
        const userId = req.user.id;
        try {
            const student = await db('students')
                .where({ user_id: userId })
                .select('*');
            const exams = await db('exams')
                .join('subjects', 'subjects.id', 'exams.subject_id')
                .where('subjects.curriculum_id', student[0].curriculum_id)
                .where('exams.announced', true)
                .where('exams.start_datetime', '>', db.fn.now())
                .andWhere('exams.exam_type', 'exam')
                .select(
                    'exams.id',
                    'exams.uuid',
                    'subject_id',
                    'semester_id',
                    'title',
                    'description',
                    'time_limit',
                    'total_mark',
                    'passing_mark',
                    'start_datetime',
                    'end_datetime',
                    'announced',
                    'name as subject_name',
                    'resources as subject_resources',
                    // 'teacher_id',
                    'curriculum_id'
                );
            return res.status(HTTP_STATUS.OK).json(exams);
        } catch (error) {
            logError('Get upcoming exam failed', error, { userId });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve upcoming exam.',
                    null,
                    'GET_UPCOMING_EXAM_ERROR'
                )
            );
        }
    },

    // Quiz counterparts
    async getAllPreQuizzesForSemester(req, res) {
        try {
            const userId = req.user.id;
            const { subjectId, semesterId } = req.body;
            const quizzes = await db('exams')
                .select(
                    'id',
                    'uuid',
                    'subject_id',
                    'title',
                    'description',
                    'time_limit',
                    'total_mark',
                    'passing_mark',
                    'start_datetime',
                    'end_datetime',
                    'semester_id'
                )
                .where({ subject_id: subjectId, semester_id: semesterId })
                .andWhere('exam_type', 'quiz');
            res.json(quizzes);
        } catch (error) {
            logError('Get pre-quizzes for semester failed', error, {
                subjectId,
                semesterId,
                userId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve pre-quizzes for semester.',
                    null,
                    'GET_PRE_QUIZZES_ERROR'
                )
            );
        }
    },

    async getsemestersBySubjectForPreQuiz(req, res) {
        const { subject_id } = req.params;
        const userId = req.user.id;
        try {
            const quizExists = await db('exams')
                .where({ subject_id })
                .andWhere('exam_type', 'quiz')
                .first();
            if (!quizExists) {
                return res.json('There are no quizzes for this subject');
            }

            const student = await db('students')
                .select('curriculum_id')
                .where({ user_id: userId })
                .first();

            if (!student) {
                return res
                    .status(404)
                    .json({ error: 'Student record not found for this user' });
            }

            const subject = await db('subjects')
                .select('curriculum_id')
                .where({ id: subject_id })
                .first();

            if (!subject) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            if (student.curriculum_id !== subject.curriculum_id) {
                return res.status(403).json({
                    error: 'Student curriculum does not match subject curriculum',
                });
            }

            const semesters = await db('exams')
                .join('semesters', 'semesters.id', 'exams.semester_id')
                .join(
                    'academic_years',
                    'academic_years.id',
                    'semesters.academic_year_id'
                )
                .where('exams.subject_id', subject_id)
                .where('exams.announced', true)
                .where('exams.end_datetime', '<=', db.fn.now())
                .where('exams.exam_type', 'quiz')
                .select(
                    'semesters.id as semesters_id',
                    'semesters.semester_name',
                    'semesters.academic_year_id',
                    db.raw(`
                    CONCAT(
                        EXTRACT(YEAR FROM academic_years.start_year)::text, 
                        '-', 
                        EXTRACT(YEAR FROM academic_years.end_year)::text
                    ) AS year
                    `)
                );

            if (semesters.length === 0) {
                return res
                    .status(200)
                    .json([]);
            }

            res.json(semesters);
        } catch (error) {
            logError('Get semesters by subject for pre-quiz failed', error, {
                subject_id,
                userId,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve semesters for pre-quiz.',
                    null,
                    'GET_SEMESTERS_QUIZ_ERROR'
                )
            );
        }
    },

    async getUpComingQuiz(req, res) {
        const userId = req.user.id;
        try {
            const student = await db('students')
                .where({ user_id: userId })
                .select('*');
            const quizzes = await db('exams')
                .join('subjects', 'subjects.id', 'exams.subject_id')
                .where('subjects.curriculum_id', student[0].curriculum_id)
                .where('exams.announced', true)
                .where('exams.start_datetime', '>', db.fn.now())
                .andWhere('exams.exam_type', 'quiz')
                .select(
                    'exams.id',
                    'exams.uuid',
                    'subject_id',
                    'semester_id',
                    'title',
                    'description',
                    'time_limit',
                    'total_mark',
                    'passing_mark',
                    'start_datetime',
                    'end_datetime',
                    'announced',
                    'name as subject_name',
                    'resources as subject_resources',
                    // 'teacher_id',
                    'curriculum_id'
                );
            return res.status(HTTP_STATUS.OK).json(quizzes);
        } catch (error) {
            logError('Get upcoming quiz failed', error, { userId });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve upcoming quiz.',
                    null,
                    'GET_UPCOMING_QUIZ_ERROR'
                )
            );
        }
    },

    // Quiz-specific endpoints for public quiz taking
    async authenticateQuizAccess(req, res) {
        try {
            const { email, password, quizId } = req.body;

            if (!email || !password || !quizId) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Email, password, and quiz ID are required.',
                            null,
                            'MISSING_REQUIRED_FIELDS'
                        )
                    );
            }

            // Find quiz by UUID
            const quiz = await db('exams')
                .where({ uuid: quizId, exam_type: 'quiz' })
                .first();

            if (!quiz) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Quiz not found.',
                            null,
                            'QUIZ_NOT_FOUND'
                        )
                    );
            }

            // Check if quiz is currently available
            const now = new Date();
            const startTime = new Date(quiz.start_datetime);
            const endTime = new Date(quiz.end_datetime);

            if (now < startTime) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Quiz has not started yet.',
                            { start_time: quiz.start_datetime },
                            'QUIZ_NOT_STARTED'
                        )
                    );
            }

            if (now > endTime) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Quiz has ended.',
                            { end_time: quiz.end_datetime },
                            'QUIZ_ENDED'
                        )
                    );
            }

            // Validate user credentials
            const user = await db('users').where({ email }).first();

            if (!user) {
                return res
                    .status(HTTP_STATUS.UNAUTHORIZED)
                    .json(
                        createErrorResponse(
                            'Invalid credentials.',
                            null,
                            'INVALID_CREDENTIALS'
                        )
                    );
            }

            // In a production environment, you should hash and compare passwords
            // For now, this is a simplified version - consider implementing proper password hashing

            const isValidPassword = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!isValidPassword) {
                return res
                    .status(HTTP_STATUS.UNAUTHORIZED)
                    .json(
                        createErrorResponse(
                            'Invalid credentials.',
                            null,
                            'INVALID_CREDENTIALS'
                        )
                    );
            }

            // Check if user is a student
            const student = await db('students')
                .where({ user_id: user.id })
                .first();

            if (!student) {
                return res
                    .status(HTTP_STATUS.FORBIDDEN)
                    .json(
                        createErrorResponse(
                            'Only students can take quizzes.',
                            null,
                            'STUDENT_ACCESS_REQUIRED'
                        )
                    );
            }

            // Check if student has already taken this quiz
            const existingAttempt = await db('exam_attempts')
                .where({
                    exam_id: quiz.id,
                    student_id: student.id,
                })
                .first();

            if (existingAttempt) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(
                    createErrorResponse(
                        'You have already taken this quiz.',
                        {
                            score: existingAttempt.score,
                            completed_at: existingAttempt.updated_at,
                        },
                        'QUIZ_ALREADY_TAKEN'
                    )
                );
            }

            res.json({
                success: true,
                message: 'Access granted',
                quiz: {
                    id: quiz.id,
                    uuid: quiz.uuid,
                    title: quiz.title,
                    description: quiz.description,
                    time_limit: quiz.time_limit,
                    total_mark: quiz.total_mark,
                },
                student: {
                    id: student.id,
                    user_id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                },
            });
        } catch (error) {
            logError('Quiz authentication failed', error, { quizId, email });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Quiz authentication failed due to server error.',
                    null,
                    'QUIZ_AUTH_ERROR'
                )
            );
        }
    },

    async getQuizData(req, res) {
        try {
            const { quizId } = req.params;
            const { email } = req.query;

            if (!email) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Email is required.',
                            null,
                            'MISSING_EMAIL'
                        )
                    );
            }

            // Find quiz by UUID
            const quiz = await db('exams')
                .where({ uuid: quizId, exam_type: 'quiz' })
                .first();

            if (!quiz) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Quiz not found.',
                            null,
                            'QUIZ_NOT_FOUND'
                        )
                    );
            }

            // Verify user access (basic check)
            const user = await db('users').where({ email }).first();

            if (!user) {
                return res
                    .status(HTTP_STATUS.UNAUTHORIZED)
                    .json(
                        createErrorResponse(
                            'Unauthorized access.',
                            null,
                            'UNAUTHORIZED_ACCESS'
                        )
                    );
            }

            // Get quiz questions with options
            const questionsData = await db('exam_question')
                .join('questions', 'questions.id', 'exam_question.question_id')
                .leftJoin('options', 'options.question_id', 'questions.id')
                .where('exam_question.exam_id', quiz.id)
                .select(
                    'questions.id as question_id',
                    'questions.question_text',
                    'questions.type',
                    'options.id as option_id',
                    'options.text as option_text',
                    'exam_question.mark'
                )
                .orderBy('questions.id')
                .orderBy('options.id');

            // Group questions and options
            const questionsMap = {};

            questionsData.forEach((row) => {
                if (!questionsMap[row.question_id]) {
                    questionsMap[row.question_id] = {
                        id: row.question_id,
                        question: row.question_text,
                        type: row.type,
                        mark: row.mark,
                        options: [],
                    };
                }

                if (row.option_id) {
                    questionsMap[row.question_id].options.push({
                        id: row.option_id.toString(),
                        text: row.option_text,
                    });
                }
            });

            const questions = Object.values(questionsMap);

            res.json({
                id: quiz.uuid,
                title: quiz.title,
                description: quiz.description,
                time_limit: quiz.time_limit,
                total_mark: quiz.total_mark,
                questions: questions,
            });
        } catch (error) {
            logError('Get quiz data failed', error, {
                quizId: req.params.quizId,
                email: req.query.email,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve quiz data.',
                    null,
                    'GET_QUIZ_DATA_ERROR'
                )
            );
        }
    },

    async submitQuizAnswers(req, res) {
        const { db } = require('../../config/db');
        let trx;

        try {
            const { quizId } = req.params;
            const { email, answers } = req.body;

            if (!email || !answers || !Array.isArray(answers)) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Email and answers array are required.',
                            null,
                            'MISSING_REQUIRED_FIELDS'
                        )
                    );
            }

            trx = await db.transaction();

            // Find quiz
            const quiz = await db('exams')
                .where({ uuid: quizId, exam_type: 'quiz' })
                .first();

            if (!quiz) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Quiz not found.',
                            null,
                            'QUIZ_NOT_FOUND'
                        )
                    );
            }

            // Find user and student
            const user = await db('users').where({ email }).first();

            if (!user) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.UNAUTHORIZED)
                    .json(
                        createErrorResponse(
                            'User not found.',
                            null,
                            'USER_NOT_FOUND'
                        )
                    );
            }

            const student = await db('students')
                .where({ user_id: user.id })
                .first();

            if (!student) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.FORBIDDEN)
                    .json(
                        createErrorResponse(
                            'Student record not found.',
                            null,
                            'STUDENT_NOT_FOUND'
                        )
                    );
            }

            // Check if already attempted
            const existingAttempt = await db('exam_attempts')
                .where({
                    exam_id: quiz.id,
                    student_id: student.id,
                })
                .first();

            if (existingAttempt) {
                await trx.rollback();
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Quiz already submitted.',
                            { score: existingAttempt.score },
                            'QUIZ_ALREADY_SUBMITTED'
                        )
                    );
            }

            // Create exam attempt
            const [examAttempt] = await trx('exam_attempts')
                .insert({
                    exam_id: quiz.id,
                    student_id: student.id,
                    score: 0, // Will be updated after grading
                })
                .returning('*');

            // Get correct answers for grading
            const correctAnswers = await trx('exam_question')
                .join('questions', 'questions.id', 'exam_question.question_id')
                .join('options', 'options.question_id', 'questions.id')
                .where('exam_question.exam_id', quiz.id)
                .where('options.is_correct', true)
                .select(
                    'questions.id as question_id',
                    'options.id as correct_option_id',
                    'exam_question.mark'
                );

            const correctAnswersMap = {};
            correctAnswers.forEach((answer) => {
                correctAnswersMap[answer.question_id] = {
                    correct_option_id: answer.correct_option_id,
                    mark: answer.mark,
                };
            });

            let totalScore = 0;
            const results = [];

            // Process each answer
            for (const answer of answers) {
                const { questionId, optionId } = answer;

                if (!questionId || !optionId) {
                    continue;
                }

                // Check if answer is correct
                const correctAnswer = correctAnswersMap[questionId];
                const isCorrect =
                    correctAnswer &&
                    correctAnswer.correct_option_id == optionId;
                const markAwarded = isCorrect ? correctAnswer.mark || 1 : 0;

                // Save the answer with mark_awarded
                await trx('answers').insert({
                    question_id: questionId,
                    exam_attempt_id: examAttempt.id,
                    option_id: optionId,
                    mark_awarded: markAwarded,
                });

                totalScore += markAwarded;
                results.push({
                    questionId,
                    isCorrect,
                    markAwarded,
                    correctOptionId: correctAnswer?.correct_option_id,
                });
            }

            // Update exam attempt with final score
            await trx('exam_attempts')
                .where('id', examAttempt.id)
                .update({ score: totalScore });

            // Get exam details for grade creation
            const examDetails = await trx('exams')
                .join('subjects', 'exams.subject_id', 'subjects.id')
                .join('semesters', 'exams.semester_id', 'semesters.id')
                .where('exams.id', quiz.id)
                .select(
                    'exams.subject_id',
                    'exams.semester_id',
                    'exams.total_mark',
                    'exams.exam_type'
                )
                .first();

            // Get or create archive for the student in current academic year
            // Find the most recent academic year that includes today's date
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            let currentAcademicYear = await trx('academic_years')
                .where('start_year', '<=', today)
                .andWhere('end_year', '>=', today)
                .orderBy('start_year', 'desc')
                .first();

            // If no current academic year found, get the most recent one
            if (!currentAcademicYear) {
                currentAcademicYear = await trx('academic_years')
                    .orderBy('start_year', 'desc')
                    .first();
            }

            if (currentAcademicYear) {
                let archive = await trx('archives')
                    .where({
                        student_id: student.id,
                        academic_year_id: currentAcademicYear.id,
                    })
                    .first();

                if (!archive) {
                    // Create archive if it doesn't exist
                    const [newArchive] = await trx('archives')
                        .insert({
                            student_id: student.id,
                            academic_year_id: currentAcademicYear.id,
                            remaining_tuition: 0,
                        })
                        .returning('*');
                    archive = newArchive;
                }

                // Create grade record for the quiz
                await trx('grades').insert({
                    archive_id: archive.id,
                    subject_id: examDetails.subject_id,
                    semester_id: examDetails.semester_id,
                    type: examDetails.exam_type,
                    grade: totalScore,
                    min_score: 0,
                    max_score: examDetails.total_mark,
                });
            }

            await trx.commit();

            res.json({
                success: true,
                totalScore,
                totalQuestions: results.length,
                correctAnswers: results.filter((r) => r.isCorrect).length,
                passed: totalScore >= quiz.passing_mark,
                passingScore: quiz.passing_mark,
                results,
            });
        } catch (error) {
            if (trx) await trx.rollback();
            logError('Submit quiz failed', error, {
                quizId: req.params.quizId,
                email,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to submit quiz due to server error.',
                    null,
                    'SUBMIT_QUIZ_ERROR'
                )
            );
        }
    },
};
