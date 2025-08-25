const examService = require('../services/examService');
const examQuestionService = require('../services/examQuestionService');
const { validationResult } = require('express-validator');
const { db } = require('../../config/db');

module.exports = {
    async createExamWithQuestions(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
            res.status(201).json({
                exam: exam[0],
                questions: questionResults,
            });
        } catch (error) {
            await trx.rollback();
            res.status(400).json({ error: error.message });
        }
    },

    async getExam(req, res) {
        try {
            const Exam = await examService.getExam(req.params.id);
            if (!Exam) return res.status(404).json({ error: 'Exam not found' });
            res.json(Exam);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllExams(req, res) {
        try {
            const Exams = await examService.getAllExams();
            res.json(Exams);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateExam(req, res) {
        try {
            const Exam = await examService.updateExam(req.params.id, req.body);
            if (!Exam || Exam.length == 0)
                return res.status(404).json({ error: 'Exam not found' });
            res.json(Exam);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteExam(req, res) {
        try {
            const result = await examService.deleteExam(req.params.id);
            if (!result)
                return res.status(404).json({ error: 'Exam not found' });
            res.status(200).json({ message: 'deleted successfuly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getExamQuestion(req, res) {
        try {
            const Exam = await examService.getExam(req.body.id);
            if (!Exam) return res.status(404).json({ error: 'Exam Not found' });
            const result = await examService.getExamQuestion(req.body.id);
            if (!result)
                return res
                    .status(404)
                    .json({ error: 'Exam questions not found' });
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
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
            res.status(500).json({ error: error.message });
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
                return res.json('There are no valid exams for this subject');
            }

            res.json(semesters);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
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
            return res.status(200).json(exams);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
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
            res.status(500).json({ error: error.message });
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
                return res.status(404).json('There are no valid quizzes for this subject');
            }

            res.json(semesters);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
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
            return res.status(200).json(quizzes);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
