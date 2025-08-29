const academicYearService = require('../services/academicYearService');
const { toDateOnly } = require('../utils/dateUtils');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createAcademicYear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const AcademicYear = await academicYearService.createAcademicYear(
                req.body
            );
            const formatted = AcademicYear.map
                ? AcademicYear.map((year) => ({
                      ...year,
                      start_year: toDateOnly(year.start_year),
                      end_year: toDateOnly(year.end_year),
                  }))
                : {
                      ...AcademicYear,
                      start_year: toDateOnly(AcademicYear.start_year),
                      end_year: toDateOnly(AcademicYear.end_year),
                  };
            res.status(HTTP_STATUS.CREATED).json(formatted);
        } catch (error) {
            logError('Create academic year failed', error, {
                start_year: req.body.start_year,
                end_year: req.body.end_year,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create academic year.',
                    null,
                    'CREATE_ACADEMIC_YEAR_ERROR'
                )
            );
        }
    },

    async getAcademicYear(req, res) {
        try {
            const AcademicYear = await academicYearService.getAcademicYear(
                req.params.id
            );
            if (!AcademicYear) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Academic Year not found',
                            null,
                            'ACADEMIC_YEAR_NOT_FOUND'
                        )
                    );
            }
            const formatted = {
                ...AcademicYear,
                start_year: toDateOnly(AcademicYear.start_year),
                end_year: toDateOnly(AcademicYear.end_year),
            };
            res.json(formatted);
        } catch (error) {
            logError('Get academic year failed', error, {
                academicYearId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve academic year.',
                    null,
                    'GET_ACADEMIC_YEAR_ERROR'
                )
            );
        }
    },

    async getAllAcademicYeares(req, res) {
        try {
            const AcademicYear =
                await academicYearService.getAllAcademicYears();
            const formatted = AcademicYear.map((year) => ({
                ...year,
                start_year: toDateOnly(year.start_year),
                end_year: toDateOnly(year.end_year),
            }));
            res.json(formatted);
        } catch (error) {
            logError('Get all academic years failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve academic years.',
                    null,
                    'GET_ACADEMIC_YEARS_ERROR'
                )
            );
        }
    },

    async updateAcademicYear(req, res) {
        try {
            const AcademicYear = await academicYearService.updateAcademicYear(
                req.params.id,
                req.body
            );
            if (!AcademicYear || AcademicYear.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Academic Year not found',
                            null,
                            'ACADEMIC_YEAR_NOT_FOUND'
                        )
                    );
            }
            const formatted = AcademicYear.map
                ? AcademicYear.map((year) => ({
                      ...year,
                      start_year: toDateOnly(year.start_year),
                      end_year: toDateOnly(year.end_year),
                  }))
                : {
                      ...AcademicYear,
                      start_year: toDateOnly(AcademicYear.start_year),
                      end_year: toDateOnly(AcademicYear.end_year),
                  };
            res.json(formatted);
        } catch (error) {
            logError('Update academic year failed', error, {
                academicYearId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update academic year.',
                    null,
                    'UPDATE_ACADEMIC_YEAR_ERROR'
                )
            );
        }
    },

    async deleteAcademicYear(req, res) {
        try {
            const result = await academicYearService.deleteAcademicYear(
                req.params.id
            );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Academic Year not found',
                            null,
                            'ACADEMIC_YEAR_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Academic year deleted successfully',
            });
        } catch (error) {
            logError('Delete academic year failed', error, {
                academicYearId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete academic year.',
                    null,
                    'DELETE_ACADEMIC_YEAR_ERROR'
                )
            );
        }
    },

    // async getStudentsInAcademicYear(req, res) {
    //   try {
    //     const AcademicYearExists = await academicYearService.getAcademicYear(req.body.id);
    //     if (!AcademicYearExists) return res.status(404).json({ error: 'AcademicYear not found' });
    //     const Students = await academicYearService.getStudentsInAcademicYear(req.body.id);
    //     if (!Students) return res.status(404).json({ error: 'Students not found' });
    //     res.json(Students);
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // },
};
