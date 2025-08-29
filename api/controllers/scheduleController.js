const scheduleService = require('../services/scheduleService');
const { validationResult } = require('express-validator');
const studentService = require('../services/studentService');
const { db } = require('../../config/db');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
} = require('../utils/errorHandler');

module.exports = {
    async createSchedule(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(handleValidationErrors(errors));
            }
            const Schedule = await scheduleService.createSchedule(req.body);
            res.status(HTTP_STATUS.CREATED).json(Schedule);
        } catch (error) {
            logError('Create schedule failed', error, {
                class_id: req.body.class_id,
                subject_id: req.body.subject_id,
                createdBy: req.user?.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create schedule.',
                    null,
                    'CREATE_SCHEDULE_ERROR'
                )
            );
        }
    },

    async getSchedule(req, res) {
        try {
            const schedule = await scheduleService.getSchedule(req.params.id);
            if (!schedule) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Schedule not found',
                            null,
                            'SCHEDULE_NOT_FOUND'
                        )
                    );
            }
            res.json(schedule);
        } catch (error) {
            logError('Get schedule failed', error, {
                scheduleId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve schedule.',
                    null,
                    'GET_SCHEDULE_ERROR'
                )
            );
        }
    },

    async getAllSchedules(req, res) {
        try {
            const schedules = await scheduleService.getAllSchedules();
            res.json(schedules);
        } catch (error) {
            logError('Get all schedules failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve schedules.',
                    null,
                    'GET_SCHEDULES_ERROR'
                )
            );
        }
    },

    async updateSchedule(req, res) {
        try {
            const schedule = await scheduleService.updateSchedule(
                req.params.id,
                req.body
            );
            if (!schedule) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Schedule not found',
                            null,
                            'SCHEDULE_NOT_FOUND'
                        )
                    );
            }
            res.json(schedule);
        } catch (error) {
            logError('Update schedule failed', error, {
                scheduleId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update schedule.',
                    null,
                    'UPDATE_SCHEDULE_ERROR'
                )
            );
        }
    },

    async deleteSchedule(req, res) {
        try {
            const result = await scheduleService.deleteSchedule(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Schedule not found',
                            null,
                            'SCHEDULE_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Schedule deleted successfully',
            });
        } catch (error) {
            logError('Delete schedule failed', error, {
                scheduleId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete schedule.',
                    null,
                    'DELETE_SCHEDULE_ERROR'
                )
            );
        }
    },

    async getSchedulesByClass(req, res) {
        try {
            const { classId } = req.params;
            const schedules = await scheduleService.getSchedulesByClass(
                classId
            );
            res.json(schedules);
        } catch (error) {
            logError('Get schedules by class failed', error, { classId });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve schedules for class.',
                    null,
                    'GET_CLASS_SCHEDULES_ERROR'
                )
            );
        }
    },
};
