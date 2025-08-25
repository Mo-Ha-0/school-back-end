const {db} = require('../../config/db');

class Grade {
  static async create(curriculumData,trx=null) {
    const query = db('grades');
    if (trx) query.transacting(trx);
    return await query.insert(curriculumData).returning('*');
  }

  static async findById(id) {
    return await db('grades').where({ id }).first();
  }

  static async findAll() {
    return await db('grades').select('*') ;
  }

  static async findAllForStudent(archive_id) {
    // Join with both subjects and semesters tables
    const grades = await db('grades')
      .where({ 'grades.archive_id': archive_id })
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('semesters', 'grades.semester_id', 'semesters.id')
      .select('grades.*', 'subjects.name as subject_name', 'semesters.semester_name');
    
    const scorecard = {};
  
    grades.forEach(gradey => {
      const { semester_id, semester_name, subject_id, subject_name, type, grade, min_score, max_score } = gradey;
      
      // Initialize semester if not exists
      if (!scorecard[semester_id]) {
        scorecard[semester_id] = {
          semester_id,
          semester_name, // Add semester name
          subjects: {},
          semesterTotalScore: 0,
          semesterCount: 0
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
          subjectCount: 0
        };
      }
      
      const subject = semester.subjects[subject_id];
      
      // Initialize grade type if not exists
      if (!subject.grade_types[type]) {
        subject.grade_types[type] = {
          type,
          assignments: [],
          typeTotalScore: 0,
          typeCount: 0
        };
      }
      
      const gradeType = subject.grade_types[type];
      
      const numericGrade = parseFloat(grade);
      const numericMax = parseFloat(max_score);
      
      gradeType.assignments.push({
        score: numericGrade,
        min_score: parseFloat(min_score),
        max_score: numericMax,
        percentage: (numericGrade / numericMax) * 100
      });
      
      gradeType.typeTotalScore += numericGrade;
      gradeType.typeCount++;
      subject.subjectTotalScore += numericGrade;
      subject.subjectCount++;
      semester.semesterTotalScore += numericGrade;
      semester.semesterCount++;
    });
    
    // Format the result with nested structure
    return Object.values(scorecard).map(semester => {
      const subjects = Object.values(semester.subjects).map(subject => {
        const gradeTypes = Object.values(subject.grade_types).map(type => ({
          type: type.type,
          assignments: type.assignments,
          typeAverage: type.typeTotalScore / type.typeCount,
          assignment_count: type.typeCount,
          typeTotal: type.typeTotalScore
        }));
        
        return {
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          grade_types: gradeTypes,
          subjectAverage: subject.subjectTotalScore / subject.subjectCount,
          totalAssignments: subject.subjectCount,
          totalScore: subject.subjectTotalScore
        };
      });
      
      return {
        semester_id: semester.semester_id,
        semester_name: semester.semester_name, // Include semester name
        subjects,
        semesterAverage: semester.semesterTotalScore / semester.semesterCount,
        totalSemesterAssignments: semester.semesterCount,
        totalSemesterScore: semester.semesterTotalScore
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

  static async delete(id) {
    return await db('grades').where({ id }).del();
  }
}

module.exports = Grade;