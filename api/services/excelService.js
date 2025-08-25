const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelService {
    /**
     * Read Excel file and extract student data
     * @param {string} filePath - Path to the uploaded Excel file
     * @returns {Array} Array of student objects
     */
    static async readExcelFile(filePath) {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error('File not found');
            }

            // Read the workbook
            const workbook = XLSX.readFile(filePath);

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Remove empty rows and get headers
            const nonEmptyRows = jsonData.filter((row) =>
                row.some(
                    (cell) => cell !== null && cell !== undefined && cell !== ''
                )
            );

            if (nonEmptyRows.length < 2) {
                throw new Error(
                    'Excel file must have at least headers and one data row'
                );
            }

            const headers = nonEmptyRows[0];
            const dataRows = nonEmptyRows.slice(1);

            // Map data to objects
            const students = dataRows.map((row, index) => {
                const student = {};
                headers.forEach((header, colIndex) => {
                    if (
                        header &&
                        row[colIndex] !== undefined &&
                        row[colIndex] !== null
                    ) {
                        // Clean header name and convert to camelCase
                        const cleanHeader = header
                            .toString()
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '_')
                            .replace(/_+/g, '_')
                            .replace(/^_|_$/g, '');

                        student[cleanHeader] = row[colIndex];
                    }
                });
                student.rowNumber = index + 2; // Excel row number (starting from 2)
                return student;
            });

            return students;
        } catch (error) {
            throw new Error(`Error reading Excel file: ${error.message}`);
        }
    }

    /**
     * Validate student data from Excel
     * @param {Array} students - Array of student objects
     * @returns {Object} Validation result with valid students and errors
     */
    static validateStudentData(students) {
        const validStudents = [];
        const errors = [];

        students.forEach((student, index) => {
            const rowErrors = [];

            // Required fields validation
            if (!student.name || !student.name.toString().trim()) {
                rowErrors.push('Name is required');
            }

            if (!student.email || !student.email.toString().trim()) {
                rowErrors.push('Email is required');
            } else if (!this.isValidEmail(student.email.toString())) {
                rowErrors.push('Invalid email format');
            }

            if (!student.phone || !student.phone.toString().trim()) {
                rowErrors.push('Phone is required');
            }

            if (!student.birth_date) {
                rowErrors.push('Birth date is required');
            } else if (!this.isValidDate(student.birth_date)) {
                rowErrors.push('Invalid birth date format (use YYYY-MM-DD)');
            }

            if (!student.grade_level) {
                rowErrors.push('Grade level is required');
            }

            if (!student.class_id) {
                rowErrors.push('Class ID is required');
            }

            // Optional field validation
            if (
                student.discount_percentage !== undefined &&
                student.discount_percentage !== null
            ) {
                const discount = parseFloat(student.discount_percentage);
                if (isNaN(discount) || discount < 0 || discount > 100) {
                    rowErrors.push(
                        'Discount percentage must be between 0 and 100'
                    );
                }
            }

            if (rowErrors.length > 0) {
                errors.push({
                    row: student.rowNumber,
                    errors: rowErrors,
                    data: student,
                });
            } else {
                // Clean and format the data
                const cleanStudent = {
                    name: student.name.toString().trim(),
                    email: student.email.toString().trim().toLowerCase(),
                    phone: student.phone.toString().trim(),
                    birth_date: this.formatDate(student.birth_date),
                    grade_level: student.grade_level.toString().trim(),
                    class_id: parseInt(student.class_id),
                    discount_percentage: student.discount_percentage
                        ? parseFloat(student.discount_percentage)
                        : 0,
                };

                validStudents.push(cleanStudent);
            }
        });

        return { validStudents, errors };
    }

    /**
     * Check if email is valid
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if date is valid
     * @param {any} date - Date to validate
     * @returns {boolean} True if valid
     */
    static isValidDate(date) {
        if (date instanceof Date) return !isNaN(date.getTime());
        if (typeof date === 'string') {
            const parsed = new Date(date);
            return !isNaN(parsed.getTime());
        }
        return false;
    }

    /**
     * Format date to YYYY-MM-DD
     * @param {any} date - Date to format
     * @returns {string} Formatted date
     */
    static formatDate(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        if (typeof date === 'string') {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
            }
        }
        return date;
    }

    /**
     * Clean up uploaded file
     * @param {string} filePath - Path to file to delete
     */
    static async cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    }
}

module.exports = ExcelService;
