const { db } = require('../../config/db');

class Grade {
    static async create(curriculumData, trx = null) {
        const query = db('grades');
        if (trx) query.transacting(trx);
        return await query.insert(curriculumData).returning('*');
    }

    static async findById(id) {
        return await db('grades').where({ id }).first();
    }

    static async findAll() {
        return await db('grades').select('*');
    }

    static async findAllForStudent(archive_id) {
        // Join with both subjects and semesters tables
        const grades = await db('grades')
            .where({ 'grades.archive_id': archive_id })
            .join('subjects', 'grades.subject_id', 'subjects.id')
            .join('semesters', 'grades.semester_id', 'semesters.id')
            .select(
                'grades.*',
                'subjects.name as subject_name',
                'semesters.semester_name'
            );

        const scorecard = {};

        grades.forEach((gradey) => {
            const {
                semester_id,
                semester_name,
                subject_id,
                subject_name,
                type,
                grade,
                min_score,
                max_score,
            } = gradey;

            // Initialize semester if not exists
            if (!scorecard[semester_id]) {
                scorecard[semester_id] = {
                    semester_id,
                    semester_name,
                    subjects: {},
                    semesterTotalScore: 0,
                    semesterTotalMaxScore: 0,
                    semesterCount: 0,
                };
            }

            const semester = scorecard[semester_id];

            // Initialize subject if not exists
            if (!semester.subjects[subject_id]) {
                semester.subjects[subject_id] = {
                    subject_id,
                    subject_name,
                    grade_types: {},
                    subjectTotalScore: 0,
                    subjectTotalMaxScore: 0,
                    subjectCount: 0,
                };
            }

            const subject = semester.subjects[subject_id];

            // Initialize grade type if not exists
            if (!subject.grade_types[type]) {
                subject.grade_types[type] = {
                    type,
                    assignments: [],
                    typeTotalScore: 0,
                    typeTotalMaxScore: 0,
                    typeCount: 0,
                };
            }

            const gradeType = subject.grade_types[type];

            const numericGrade = parseFloat(grade) || 0;
            const numericMax = parseFloat(max_score) || 0;
            const numericMin = parseFloat(min_score) || 0;

            // Calculate percentage correctly
            const percentage =
                numericMax > 0 ? (numericGrade / numericMax) * 100 : 0;

            gradeType.assignments.push({
                score: numericGrade,
                min_score: numericMin,
                max_score: numericMax,
                percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
            });

            gradeType.typeTotalScore += numericGrade;
            gradeType.typeTotalMaxScore += numericMax;
            gradeType.typeCount++;

            subject.subjectTotalScore += numericGrade;
            subject.subjectTotalMaxScore += numericMax;
            subject.subjectCount++;

            semester.semesterTotalScore += numericGrade;
            semester.semesterTotalMaxScore += numericMax;
            semester.semesterCount++;
        });

        // Format the result with nested structure
        return Object.values(scorecard).map((semester) => {
            const subjects = Object.values(semester.subjects).map((subject) => {
                const gradeTypes = Object.values(subject.grade_types).map(
                    (type) => {
                        const typeAverage =
                            type.typeCount > 0
                                ? type.typeTotalScore / type.typeCount
                                : 0;

                        return {
                            type: type.type,
                            assignments: type.assignments,
                            typeAverage: Math.round(typeAverage * 100) / 100,
                            assignment_count: type.typeCount,
                            typeTotal:
                                Math.round(type.typeTotalScore * 100) / 100,
                        };
                    }
                );

                const subjectAverage =
                    subject.subjectCount > 0
                        ? subject.subjectTotalScore / subject.subjectCount
                        : 0;

                return {
                    subject_id: subject.subject_id,
                    subject_name: subject.subject_name,
                    grade_types: gradeTypes,
                    subjectAverage: Math.round(subjectAverage * 100) / 100,
                    totalAssignments: subject.subjectCount,
                    totalScore:
                        Math.round(subject.subjectTotalScore * 100) / 100,
                };
            });

            const semesterAverage =
                semester.semesterCount > 0
                    ? semester.semesterTotalScore / semester.semesterCount
                    : 0;

            return {
                semester_id: semester.semester_id,
                semester_name: semester.semester_name,
                subjects,
                semesterAverage: Math.round(semesterAverage * 100) / 100,
                totalSemesterAssignments: semester.semesterCount,
                totalSemesterScore:
                    Math.round(semester.semesterTotalScore * 100) / 100,
            };
        });
    }
    // static async findAllForStudent(archive_id) {
    //   const grades = await db('grades').where({ archive_id }).select('*');
    //   const scorecard = {};

    //   grades.forEach(gradey => {
    //     const { subject_id, type, grade, min_score, max_score } = gradey;

    //     if (!scorecard[subject_id]) {
    //       scorecard[subject_id] = {
    //         subject_id,
    //         types: {} // Group by type
    //       };
    //     }

    //     if (!scorecard[subject_id].types[type]) {
    //       scorecard[subject_id].types[type] = {
    //         assignments: [],
    //         total: 0,
    //         count: 0
    //       };
    //     }

    //     const numericGrade = parseFloat(grade);
    //     const numericMax = parseFloat(max_score);

    //     scorecard[subject_id].types[type].assignments.push({
    //       score: numericGrade,
    //       min_score: parseFloat(min_score),
    //       max_score: numericMax,
    //       percentage: (numericGrade / numericMax) * 100
    //     });

    //     scorecard[subject_id].types[type].total += numericGrade;
    //     scorecard[subject_id].types[type].count++;
    //   });

    //   // Format the result with type averages
    //   return Object.values(scorecard).map(subject => {
    //     const types = Object.entries(subject.types).map(([typeName, typeData]) => ({
    //       type: typeName,
    //       assignments: typeData.assignments,
    //       average: typeData.total / typeData.count,
    //       total: typeData.total,
    //       count: typeData.count
    //     }));

    //     // Calculate overall subject average
    //     const totalScore = types.reduce((sum, type) => sum + type.total, 0);
    //     const totalCount = types.reduce((sum, type) => sum + type.count, 0);

    //     return {
    //       subject_id: subject.subject_id,
    //       types,
    //       overall_average: totalCount > 0 ? totalScore / totalCount : 0,
    //       total_assignments: totalCount
    //     };
    //   });
    // }

    static async update(id, updates) {
        return await db('grades').where({ id }).update(updates).returning('*');
    }

    static async findStudentArchiveForCurrentYear(studentId, currentDate) {
        // Find student archive for current academic year
        const archive = await db('archives')
            .join(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('archives.student_id', studentId)
            .where('academic_years.start_year', '<=', currentDate)
            .andWhere('academic_years.end_year', '>=', currentDate)
            .select('archives.*')
            .first();

        return archive;
    }

    static async delete(id) {
        return await db('grades').where({ id }).del();
    }
}

module.exports = Grade;
