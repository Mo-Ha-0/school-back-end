const behaviorService = require('../services/behaviorService');
const studentService = require('../services/studentService');
const { validationResult } = require('express-validator');
const { toDateOnly } = require('../utils/dateUtils');
const { stripSensitive } = require('../utils/sanitize');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createBehavior(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const { student_id, description, type } = req.body;
            const created_by = req.user.id;
            const date = new Date(); // Set date to current date

            const behavior = await behaviorService.createBehavior({
                student_id,
                description,
                date,
                type,
                created_by,
            });
            res.status(HTTP_STATUS.CREATED).json(behavior);
        } catch (error) {
            logError('Create behavior failed', error, {
                student_id: req.body.student_id,
                type: req.body.type,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create behavior record.',
                    null,
                    'CREATE_BEHAVIOR_ERROR'
                )
            );
        }
    },

    async getBehavior(req, res) {
        try {
            const behavior = await behaviorService.getBehavior(req.params.id);
            if (!behavior) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Behavior not found',
                            null,
                            'BEHAVIOR_NOT_FOUND'
                        )
                    );
            }

            res.json(behavior);
        } catch (error) {
            logError('Get behavior failed', error, {
                behaviorId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve behavior.',
                    null,
                    'GET_BEHAVIOR_ERROR'
                )
            );
        }
    },

    async getAllBehaviors(req, res) {
        try {
            const behaviors = await behaviorService.getAllBehaviors();
            res.json(behaviors);
        } catch (error) {
            logError('Get all behaviors failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve behaviors.',
                    null,
                    'GET_BEHAVIORS_ERROR'
                )
            );
        }
    },

    async updateBehavior(req, res) {
        try {
            const behavior = await behaviorService.updateBehavior(
                req.params.id,
                req.body
            );
            if (!behavior || behavior.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Behavior not found',
                            null,
                            'BEHAVIOR_NOT_FOUND'
                        )
                    );
            }
            res.json(behavior);
        } catch (error) {
            logError('Update behavior failed', error, {
                behaviorId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update behavior.',
                    null,
                    'UPDATE_BEHAVIOR_ERROR'
                )
            );
        }
    },

    async deleteBehavior(req, res) {
        try {
            const result = await behaviorService.deleteBehavior(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Behavior not found',
                            null,
                            'BEHAVIOR_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Behavior deleted successfully',
            });
        } catch (error) {
            logError('Delete behavior failed', error, {
                behaviorId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete behavior.',
                    null,
                    'DELETE_BEHAVIOR_ERROR'
                )
            );
        }
    },

    async getMyBehaviors(req, res) {
        try {
            const userId = req.user.id;
            const student = await studentService.findByUserId(userId);
            if (!student) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Student not found',
                            null,
                            'STUDENT_NOT_FOUND'
                        )
                    );
            }
            const behaviors = await behaviorService.getBehaviorsByStudentId(
                student.id
            );
            const formatted = behaviors.map((behavior) => ({
                ...behavior,
                date: toDateOnly(behavior.date),
            }));
            res.json(stripSensitive(formatted));
        } catch (error) {
            logError('Get my behaviors failed', error, {
                userId: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve student behaviors.',
                    null,
                    'GET_STUDENT_BEHAVIORS_ERROR'
                )
            );
        }
    },
};
