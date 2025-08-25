// api/models/TuitionPayment.js (Updated and Enhanced)
const { db } = require('../../config/db');

class TuitionPayment {
    static get tableName() {
        return 'tuition_payments';
    }

    static async findAll(filters = {}) {
        let query = db(this.tableName)
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'student_users.name as student_name',
                'student_users.email as student_email',
                'student_users.phone as student_phone',
                'verifier_users.name as verified_by_name',
                'classes.class_name',
                'academic_years.start_year',
                'academic_years.end_year'
            )
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .leftJoin(
                'users as verifier_users',
                'tuition_payments.verified_by',
                'verifier_users.id'
            )
            .leftJoin('classes', 'students.class_id', 'classes.id')
            .leftJoin('archives', 'tuition_payments.archive_id', 'archives.id')
            .leftJoin(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            );

        if (filters.student_id) {
            query = query.where(
                'tuition_payments.student_id',
                filters.student_id
            );
        }

        if (filters.payment_method) {
            query = query.where(
                'tuition_payments.payment_method',
                filters.payment_method
            );
        }

        if (filters.date_from) {
            query = query.where(
                'tuition_payments.payment_date',
                '>=',
                filters.date_from
            );
        }

        if (filters.date_to) {
            query = query.where(
                'tuition_payments.payment_date',
                '<=',
                filters.date_to
            );
        }

        if (filters.verified === true) {
            query = query.whereNotNull('tuition_payments.verified_by');
        } else if (filters.verified === false) {
            query = query.whereNull('tuition_payments.verified_by');
        }

        if (filters.archive_id) {
            query = query.where(
                'tuition_payments.archive_id',
                filters.archive_id
            );
        }

        if (filters.academic_year_id) {
            query = query.where(
                'archives.academic_year_id',
                filters.academic_year_id
            );
        }

        return await query.orderBy('tuition_payments.payment_date', 'desc');
    }

    static async findById(id) {
        return await db(this.tableName)
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'student_users.name as student_name',
                'student_users.email as student_email',
                'student_users.phone as student_phone',
                'verifier_users.name as verified_by_name',
                'classes.class_name',
                'academic_years.start_year',
                'academic_years.end_year'
            )
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .leftJoin(
                'users as verifier_users',
                'tuition_payments.verified_by',
                'verifier_users.id'
            )
            .leftJoin('classes', 'students.class_id', 'classes.id')
            .leftJoin('archives', 'tuition_payments.archive_id', 'archives.id')
            .leftJoin(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('tuition_payments.id', id)
            .first();
    }

    static async create(paymentData) {
        const [id] = await db(this.tableName)
            .insert(paymentData)
            .returning('id');
        return await this.findById(id);
    }

    static async update(id, paymentData) {
        await db(this.tableName)
            .where('id', id)
            .update({
                ...paymentData,
                updated_at: new Date(),
            });
        return await this.findById(id);
    }

    static async delete(id) {
        return await db(this.tableName).where('id', id).del();
    }

    static async findByStudentId(studentId) {
        return await db(this.tableName)
            .select(
                'tuition_payments.*',
                'verifier_users.name as verified_by_name',
                'academic_years.start_year',
                'academic_years.end_year'
            )
            .leftJoin(
                'users as verifier_users',
                'tuition_payments.verified_by',
                'verifier_users.id'
            )
            .leftJoin('archives', 'tuition_payments.archive_id', 'archives.id')
            .leftJoin(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('tuition_payments.student_id', studentId)
            .orderBy('payment_date', 'desc');
    }

    static async getTotalAmountByStudent(studentId) {
        const result = await db(this.tableName)
            .where('student_id', studentId)
            .sum('amount as total_amount')
            .first();
        return parseFloat(result.total_amount) || 0;
    }

    static async getPaymentStats(filters = {}) {
        let query = db(this.tableName);

        if (filters.date_from) {
            query = query.where('payment_date', '>=', filters.date_from);
        }

        if (filters.date_to) {
            query = query.where('payment_date', '<=', filters.date_to);
        }

        return await query
            .select('payment_method')
            .sum('amount as total_amount')
            .count('id as payment_count')
            .avg('amount as average_amount')
            .groupBy('payment_method');
    }

    static async getUnverifiedPayments() {
        return await db(this.tableName)
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'student_users.name as student_name',
                'student_users.email as student_email'
            )
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .whereNull('verified_by')
            .orderBy('payment_date', 'desc');
    }

    static async getPaymentsByAcademicYear(academicYearId) {
        return await db(this.tableName)
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'student_users.name as student_name'
            )
            .join('archives', 'tuition_payments.archive_id', 'archives.id')
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .where('archives.academic_year_id', academicYearId)
            .orderBy('tuition_payments.payment_date', 'desc');
    }

    static async getMonthlyReport(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return await db(this.tableName)
            .select(
                db.raw('DATE(payment_date) as payment_date'),
                db.raw('SUM(amount) as daily_total'),
                db.raw('COUNT(*) as payment_count'),
                'payment_method'
            )
            .where('payment_date', '>=', startDate)
            .where('payment_date', '<=', endDate)
            .groupBy(db.raw('DATE(payment_date)'), 'payment_method')
            .orderBy('payment_date');
    }

    static async getYearlyReport(year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        return await db(this.tableName)
            .select(
                db.raw('EXTRACT(MONTH FROM payment_date) as month'),
                db.raw('SUM(amount) as monthly_total'),
                db.raw('COUNT(*) as payment_count'),
                'payment_method'
            )
            .where('payment_date', '>=', startDate)
            .where('payment_date', '<=', endDate)
            .groupBy(
                db.raw('EXTRACT(MONTH FROM payment_date)'),
                'payment_method'
            )
            .orderBy('month');
    }

    static async getTopPayingStudents(limit = 10, filters = {}) {
        let query = db(this.tableName)
            .select(
                'tuition_payments.student_id',
                'student_users.name as student_name',
                'classes.class_name',
                db.raw('SUM(tuition_payments.amount) as total_paid'),
                db.raw('COUNT(tuition_payments.id) as payment_count')
            )
            .join('students', 'tuition_payments.student_id', 'students.id')
            .join(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .leftJoin('classes', 'students.class_id', 'classes.id')
            .groupBy(
                'tuition_payments.student_id',
                'student_users.name',
                'classes.class_name'
            );

        if (filters.date_from) {
            query = query.where(
                'tuition_payments.payment_date',
                '>=',
                filters.date_from
            );
        }

        if (filters.date_to) {
            query = query.where(
                'tuition_payments.payment_date',
                '<=',
                filters.date_to
            );
        }

        return await query.orderBy('total_paid', 'desc').limit(limit);
    }

    static async getPaymentTrends(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db(this.tableName)
            .select(
                db.raw('DATE(payment_date) as payment_date'),
                db.raw('SUM(amount) as daily_total'),
                db.raw('COUNT(*) as payment_count')
            )
            .where('payment_date', '>=', startDate)
            .groupBy(db.raw('DATE(payment_date)'))
            .orderBy('payment_date');
    }

    static async bulkInsert(payments) {
        return await db(this.tableName).insert(payments).returning('*');
    }

    static async getStudentPaymentHistory(studentId, academicYearId = null) {
        let query = db(this.tableName)
            .select(
                'tuition_payments.*',
                'verifier_users.name as verified_by_name',
                'academic_years.start_year',
                'academic_years.end_year'
            )
            .leftJoin(
                'users as verifier_users',
                'tuition_payments.verified_by',
                'verifier_users.id'
            )
            .leftJoin('archives', 'tuition_payments.archive_id', 'archives.id')
            .leftJoin(
                'academic_years',
                'archives.academic_year_id',
                'academic_years.id'
            )
            .where('tuition_payments.student_id', studentId);

        if (academicYearId) {
            query = query.where('archives.academic_year_id', academicYearId);
        }

        return await query.orderBy('tuition_payments.payment_date', 'desc');
    }

    static async searchPayments(searchTerm, filters = {}) {
        let query = db(this.tableName)
            .select(
                'tuition_payments.*',
                'students.user_id as student_user_id',
                'student_users.name as student_name',
                'student_users.email as student_email',
                'verifier_users.name as verified_by_name'
            )
            .leftJoin('students', 'tuition_payments.student_id', 'students.id')
            .leftJoin(
                'users as student_users',
                'students.user_id',
                'student_users.id'
            )
            .leftJoin(
                'users as verifier_users',
                'tuition_payments.verified_by',
                'verifier_users.id'
            )
            .where(function () {
                this.where('student_users.name', 'ilike', `%${searchTerm}%`)
                    .orWhere('student_users.email', 'ilike', `%${searchTerm}%`)
                    .orWhere(
                        'tuition_payments.amount',
                        '=',
                        parseFloat(searchTerm) || 0
                    );
            });

        // Apply additional filters
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== undefined && filters[key] !== null) {
                query = query.where(`tuition_payments.${key}`, filters[key]);
            }
        });

        return await query.orderBy('tuition_payments.payment_date', 'desc');
    }
}

module.exports = TuitionPayment;
