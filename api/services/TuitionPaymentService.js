// api/services/tuitionPaymentService.js
const TuitionPayment = require('../models/TuitionPayment');
const Student = require('../models/Student');
const Archive = require('../models/Archive');
const { db } = require('../../config/db');

module.exports = {
    async createTuitionPayment(paymentData) {
        const { db } = require('../../config/db');

        return await db.transaction(async (trx) => {
            // Validate student exists
            const student = await db('students')
                .where({ id: paymentData.student_id })
                .first()
                .transacting(trx);
            if (!student) {
                throw new Error('Student not found');
            }

            // Determine target archive for current academic year if not provided
            let targetArchiveId = paymentData.archive_id;
            if (!targetArchiveId) {
                const today = new Date().toISOString().split('T')[0];
                let currentAcademicYear = await db('academic_years')
                    .where('start_year', '<=', today)
                    .andWhere('end_year', '>=', today)
                    .orderBy('start_year', 'desc')
                    .first()
                    .transacting(trx);
                if (!currentAcademicYear) {
                    currentAcademicYear = await db('academic_years')
                        .orderBy('start_year', 'desc')
                        .first()
                        .transacting(trx);
                }
                if (!currentAcademicYear) {
                    throw new Error(
                        'No academic year found to associate payment'
                    );
                }
                const archive = await db('archives')
                    .where({
                        student_id: paymentData.student_id,
                        academic_year_id: currentAcademicYear.id,
                    })
                    .first()
                    .transacting(trx);
                if (!archive) {
                    // Create archive for the student with remaining_tuition = full_tuition
                    const created = await db('archives')
                        .insert({
                            student_id: paymentData.student_id,
                            academic_year_id: currentAcademicYear.id,
                            remaining_tuition:
                                currentAcademicYear.full_tuition || 0,
                        })
                        .returning('*')
                        .transacting(trx);
                    targetArchiveId = created[0].id;
                } else {
                    targetArchiveId = archive.id;
                }
            }

            // Create the payment
            const payment = await db('tuition_payments')
                .insert({ ...paymentData, archive_id: targetArchiveId })
                .returning('*')
                .transacting(trx);

            // Update archive if archive_id is provided
            if (targetArchiveId) {
                const archive = await db('archives')
                    .where({ id: targetArchiveId })
                    .first()
                    .transacting(trx);
                if (archive) {
                    const newRemainingTuition = Math.max(
                        0,
                        archive.remaining_tuition - paymentData.amount
                    );
                    await db('archives')
                        .where({ id: targetArchiveId })
                        .update({ remaining_tuition: newRemainingTuition })
                        .transacting(trx);
                }
            }

            return payment[0];
        });
    },

    async getTuitionPayment(id) {
        return await TuitionPayment.findById(id);
    },

    async getAllTuitionPayments(filters = {}) {
        return await TuitionPayment.findAll(filters);
    },

    async updateTuitionPayment(id, updates) {
        const { db } = require('../../config/db');

        return await db.transaction(async (trx) => {
            const existingPayment = await db('tuition_payments')
                .where({ id })
                .first()
                .transacting(trx);
            if (!existingPayment) {
                throw new Error('Payment not found');
            }

            // If amount is being updated and there's an archive_id, adjust the archive
            if (updates.amount && existingPayment.archive_id) {
                const archive = await db('archives')
                    .where({ id: existingPayment.archive_id })
                    .first()
                    .transacting(trx);
                if (archive) {
                    // Reverse the old payment and apply the new one
                    const amountDifference =
                        updates.amount - existingPayment.amount;
                    const newRemainingTuition = Math.max(
                        0,
                        archive.remaining_tuition - amountDifference
                    );
                    await db('archives')
                        .where({ id: existingPayment.archive_id })
                        .update({ remaining_tuition: newRemainingTuition })
                        .transacting(trx);
                }
            }

            const updatedPayment = await db('tuition_payments')
                .where({ id })
                .update(updates)
                .returning('*')
                .transacting(trx);

            return updatedPayment[0];
        });
    },

    async deleteTuitionPayment(id) {
        const { db } = require('../../config/db');

        return await db.transaction(async (trx) => {
            const payment = await db('tuition_payments')
                .where({ id })
                .first()
                .transacting(trx);
            if (!payment) {
                return false;
            }

            // If there's an archive_id, restore the amount to remaining_tuition
            if (payment.archive_id) {
                const archive = await db('archives')
                    .where({ id: payment.archive_id })
                    .first()
                    .transacting(trx);
                if (archive) {
                    const newRemainingTuition =
                        archive.remaining_tuition + payment.amount;
                    await db('archives')
                        .where({ id: payment.archive_id })
                        .update({ remaining_tuition: newRemainingTuition })
                        .transacting(trx);
                }
            }

            const result = await db('tuition_payments')
                .where({ id })
                .del()
                .transacting(trx);
            return result > 0;
        });
    },

    async getPaymentsByStudent(studentId) {
        return await TuitionPayment.findByStudentId(studentId);
    },

    async getTotalAmountByStudent(studentId) {
        return await TuitionPayment.getTotalAmountByStudent(studentId);
    },

    async getPaymentStats(filters = {}) {
        return await TuitionPayment.getPaymentStats(filters);
    },

    async verifyPayment(paymentId, verifierId) {
        return await TuitionPayment.update(paymentId, {
            verified_by: verifierId,
        });
    },

    async getStudentBalance(studentId) {
        const { db } = require('../../config/db');

        // Get total paid amount
        const totalPaid = await this.getTotalAmountByStudent(studentId);

        // Get total tuition from current archive
        const currentArchive = await db('archives')
            .join(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('archives.student_id', studentId)
            .where('academic_years.end_year', '>=', new Date())
            .orderBy('academic_years.start_year', 'desc')
            .first();

        const remainingTuition = currentArchive
            ? currentArchive.remaining_tuition
            : 0;
        const totalTuition = currentArchive
            ? totalPaid + remainingTuition
            : totalPaid;

        return {
            student_id: studentId,
            total_tuition: totalTuition,
            total_paid: totalPaid,
            remaining_balance: remainingTuition,
            payment_percentage:
                totalTuition > 0
                    ? ((totalPaid / totalTuition) * 100).toFixed(2)
                    : 0,
        };
    },

    async bulkCreatePayments(payments) {
        const { db } = require('../../config/db');

        return await db.transaction(async (trx) => {
            const results = [];

            for (const paymentData of payments) {
                // Validate student exists
                const student = await db('students')
                    .where({ id: paymentData.student_id })
                    .first()
                    .transacting(trx);
                if (!student) {
                    throw new Error(
                        `Student with ID ${paymentData.student_id} not found`
                    );
                }

                // Determine target archive for current academic year if not provided
                let targetArchiveId = paymentData.archive_id;
                if (!targetArchiveId) {
                    const today = new Date().toISOString().split('T')[0];
                    let currentAcademicYear = await db('academic_years')
                        .where('start_year', '<=', today)
                        .andWhere('end_year', '>=', today)
                        .orderBy('start_year', 'desc')
                        .first()
                        .transacting(trx);
                    if (!currentAcademicYear) {
                        currentAcademicYear = await db('academic_years')
                            .orderBy('start_year', 'desc')
                            .first()
                            .transacting(trx);
                    }
                    if (!currentAcademicYear) {
                        throw new Error(
                            'No academic year found to associate payment'
                        );
                    }
                    const archive = await db('archives')
                        .where({
                            student_id: paymentData.student_id,
                            academic_year_id: currentAcademicYear.id,
                        })
                        .first()
                        .transacting(trx);
                    if (!archive) {
                        const created = await db('archives')
                            .insert({
                                student_id: paymentData.student_id,
                                academic_year_id: currentAcademicYear.id,
                                remaining_tuition:
                                    currentAcademicYear.full_tuition || 0,
                            })
                            .returning('*')
                            .transacting(trx);
                        targetArchiveId = created[0].id;
                    } else {
                        targetArchiveId = archive.id;
                    }
                }

                // Create the payment
                const payment = await db('tuition_payments')
                    .insert({ ...paymentData, archive_id: targetArchiveId })
                    .returning('*')
                    .transacting(trx);

                // Update archive if archive_id is provided
                if (targetArchiveId) {
                    const archive = await db('archives')
                        .where({ id: targetArchiveId })
                        .first()
                        .transacting(trx);
                    if (archive) {
                        const newRemainingTuition = Math.max(
                            0,
                            archive.remaining_tuition - paymentData.amount
                        );
                        await db('archives')
                            .where({ id: targetArchiveId })
                            .update({ remaining_tuition: newRemainingTuition })
                            .transacting(trx);
                    }
                }

                results.push(payment[0]);
            }

            return results;
        });
    },

    async getPaymentsByDateRange(startDate, endDate) {
        const { db } = require('../../config/db');

        return await db('tuition_payments')
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'users.name as student_name'
            )
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin('users', 'students.user_id', 'users.id')
            .where('tuition_payments.payment_date', '>=', startDate)
            .where('tuition_payments.payment_date', '<=', endDate)
            .orderBy('tuition_payments.payment_date', 'desc');
    },

    async getOutstandingPayments() {
        const { db } = require('../../config/db');

        return await db('archives')
            .select(
                'archives.student_id',
                'archives.remaining_tuition',
                'users.name as student_name',
                'users.email as student_email',
                'users.phone as student_phone',
                'academic_years.start_year',
                'academic_years.end_year'
            )
            .join('students', 'archives.student_id', 'students.id')
            .join('users', 'students.user_id', 'users.id')
            .join(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('archives.remaining_tuition', '>', 0)
            .orderBy('archives.remaining_tuition', 'desc');
    },

    async getMonthlyPaymentReport(year, month) {
        const { db } = require('../../config/db');

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return await db('tuition_payments')
            .select(
                db.raw('DATE(payment_date) as payment_date'),
                db.raw('SUM(amount) as daily_total'),
                db.raw('COUNT(*) as payment_count')
            )
            .where('payment_date', '>=', startDate)
            .where('payment_date', '<=', endDate)
            .groupBy(db.raw('DATE(payment_date)'))
            .orderBy('payment_date');
    },

    async getPaymentMethodStats(filters = {}) {
        const { db } = require('../../config/db');

        let query = db('tuition_payments')
            .select('payment_method')
            .sum('amount as total_amount')
            .count('id as payment_count')
            .avg('amount as average_amount')
            .groupBy('payment_method');

        if (filters.date_from) {
            query = query.where('payment_date', '>=', filters.date_from);
        }
        if (filters.date_to) {
            query = query.where('payment_date', '<=', filters.date_to);
        }

        return await query;
    },
};
