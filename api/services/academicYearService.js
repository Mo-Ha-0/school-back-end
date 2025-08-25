const academic_year = require('../models/academic_year');
const { db } = require('../../config/db');

module.exports = {
    async createAcademicYear(academicYearData) {
        // Create academic year and its two semesters atomically
        return await db.transaction(async (trx) => {
            // 1) Insert academic year and get the inserted row (or id depending on driver)
            const inserted = await trx('academic_years')
                .insert(academicYearData)
                .returning('*');

            let insertedYearRow;
            let insertedYearId;

            if (Array.isArray(inserted)) {
                if (inserted.length > 0 && typeof inserted[0] === 'object') {
                    insertedYearRow = inserted[0];
                    insertedYearId = insertedYearRow.id;
                } else {
                    insertedYearId = inserted[0];
                    insertedYearRow = await trx('academic_years')
                        .where({ id: insertedYearId })
                        .first();
                }
            } else if (typeof inserted === 'object' && inserted !== null) {
                insertedYearRow = inserted;
                insertedYearId = insertedYearRow.id;
            } else {
                insertedYearId = inserted;
                insertedYearRow = await trx('academic_years')
                    .where({ id: insertedYearId })
                    .first();
            }

            // 2) Derive semester dates from academic year
            const startDate = new Date(academicYearData.start_year);
            const endDate = new Date(academicYearData.end_year);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid start_year or end_year');
            }

            const diffMs = endDate.getTime() - startDate.getTime();
            const midMs = startDate.getTime() + Math.floor(diffMs / 2);
            const midDate = new Date(midMs);
            const secondStart = new Date(midDate);
            secondStart.setDate(secondStart.getDate() + 1);

            const toYmd = (d) => d.toISOString().split('T')[0];

            const semesters = [
                {
                    start_date: toYmd(startDate),
                    end_date: toYmd(midDate),
                    academic_year_id: insertedYearId,
                    semester_name: 'First Semester',
                },
                {
                    start_date: toYmd(secondStart),
                    end_date: toYmd(endDate),
                    academic_year_id: insertedYearId,
                    semester_name: 'Second Semester',
                },
            ];

            await trx('semesters').insert(semesters);

            // 3) Return the same shape as the insert returning for backward compatibility
            return inserted;
        });
    },

    async getAcademicYear(id) {
        return await academic_year.findById(id);
    },

    async getAllAcademicYears() {
        return await academic_year.findAll();
    },

    async updateAcademicYear(id, updates) {
        return await academic_year.update(id, updates);
    },

    async deleteAcademicYear(id) {
        return await academic_year.delete(id);
    },
    // async getStudentsInAcademicYear(id) {
    //   return await academic_year.getStudentsInClass(id);
    // },
};
