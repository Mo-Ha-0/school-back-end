const curriculumService = require('../services/curriculumService');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

const bcrypt = require('bcrypt-nodejs');
module.exports = {
    async createCurriculum(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Curriculum = await curriculumService.createCurriculum(
                req.body
            );
            res.status(HTTP_STATUS.CREATED).json(Curriculum);
        } catch (error) {
            logError('Create curriculum failed', error, {
                name: req.body.name,
                description: req.body.description,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create curriculum.',
                    null,
                    'CREATE_CURRICULUM_ERROR'
                )
            );
        }
    },

    async getCurriculum(req, res) {
        try {
            const Curriculum = await curriculumService.getCurriculum(
                req.params.id
            );
            if (!Curriculum) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Curriculum not found',
                            null,
                            'CURRICULUM_NOT_FOUND'
                        )
                    );
            }
            res.json(Curriculum);
        } catch (error) {
            logError('Get curriculum failed', error, {
                curriculumId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve curriculum.',
                    null,
                    'GET_CURRICULUM_ERROR'
                )
            );
        }
    },

    async getAllCurriculums(req, res) {
        try {
            const Curriculum = await curriculumService.getAllCurriculumes();
            res.json(Curriculum);
        } catch (error) {
            logError('Get all curriculums failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve curriculums.',
                    null,
                    'GET_CURRICULUMS_ERROR'
                )
            );
        }
    },

    async updateCurriculum(req, res) {
        try {
            const Curriculum = await curriculumService.updateCurriculum(
                req.params.id,
                req.body
            );
            if (!Curriculum || Curriculum.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Curriculum not found',
                            null,
                            'CURRICULUM_NOT_FOUND'
                        )
                    );
            }
            res.json(Curriculum);
        } catch (error) {
            logError('Update curriculum failed', error, {
                curriculumId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update curriculum.',
                    null,
                    'UPDATE_CURRICULUM_ERROR'
                )
            );
        }
    },

    async deleteCurriculum(req, res) {
        try {
            const result = await curriculumService.deleteCurriculum(
                req.params.id
            );
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Curriculum not found',
                            null,
                            'CURRICULUM_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Curriculum deleted successfully',
            });
        } catch (error) {
            logError('Delete curriculum failed', error, {
                curriculumId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete curriculum.',
                    null,
                    'DELETE_CURRICULUM_ERROR'
                )
            );
        }
    },
};
