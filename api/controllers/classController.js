const classService = require('../services/classService');
const { db } = require('../../config/db');
const { validationResult } = require('express-validator');
const {
    createErrorResponse,
    HTTP_STATUS,
    handleValidationErrors,
    logError,
    handleTransactionError,
} = require('../utils/errorHandler');

module.exports = {
    async createClass(req, res) {
        try {
            const classData = req.body;
            // Map frontend field names to database field names
            const dbData = {
                class_name: classData.class_name,
                floor_number: classData.floor_number,
                level_grade: classData.level_grade,
            };

            // Validate required fields first
            if (
                !dbData.class_name ||
                dbData.floor_number === undefined ||
                !dbData.level_grade
            ) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'class_name, floor_number, and level_grade are required',
                            null,
                            'MISSING_REQUIRED_FIELDS'
                        )
                    );
            }

            return await db.transaction(async (trx) => {
                // 1. Create the class with validated data
                const [classId] = await trx('classes')
                    .insert(dbData)
                    .returning('id');

                // 2. Get all days and periods from database
                const days = await trx('days').select('id').orderBy('id');
                const periods = await trx('periods')
                    .select('id')
                    .orderBy('start_time');
                console.log(classId, days, periods);
                // 3. Generate schedule slots
                const scheduleSlots = days.flatMap((day) =>
                    periods.map((period) => ({
                        class_id: classId.id,
                        day_id: day.id,
                        period_id: period.id,
                        subject_id: null,
                    }))
                );

                // 4. Insert schedule slots
                await trx('schedules').insert(scheduleSlots);

                res.json({
                    success: true,
                    classId,
                    slotsCreated: scheduleSlots.length,
                });
            });
        } catch (error) {
            logError('Create class failed', error, {
                class_name: req.body.class_name,
                level_grade: req.body.level_grade,
                createdBy: req.user?.id,
            });

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to create class due to server error.',
                    null,
                    'CREATE_CLASS_ERROR'
                )
            );
        }
    },

    async getClass(req, res) {
        try {
            const Class = await classService.getClass(req.params.id);
            if (!Class) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            res.json(Class);
        } catch (error) {
            logError('Get class failed', error, { classId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve class.',
                    null,
                    'GET_CLASS_ERROR'
                )
            );
        }
    },

    async getClassesGroupedByGrade(req, res) {
        try {
            const Classes = await classService.getClassesGroupedByGrade();
            if (!Classes) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Classes not found.',
                            null,
                            'CLASSES_NOT_FOUND'
                        )
                    );
            }
            res.json(Classes);
        } catch (error) {
            logError('Get classes grouped by grade failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve classes grouped by grade.',
                    null,
                    'GET_CLASSES_GROUPED_ERROR'
                )
            );
        }
    },

    async getAllClasses(req, res) {
        try {
            const Class = await classService.getAllClasses();
            res.json(Class);
        } catch (error) {
            logError('Get all classes failed', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve classes.',
                    null,
                    'GET_CLASSES_ERROR'
                )
            );
        }
    },

    async updateClass(req, res) {
        try {
            // Use the new field names directly
            const dbData = {
                class_name: req.body.class_name,
                floor_number: req.body.floor_number,
                level_grade: req.body.level_grade,
            };

            const Class = await classService.updateClass(req.params.id, dbData);
            if (!Class || Class.length == 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            res.json(Class);
        } catch (error) {
            logError('Update class failed', error, { classId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to update class.',
                    null,
                    'UPDATE_CLASS_ERROR'
                )
            );
        }
    },

    async deleteClass(req, res) {
        try {
            const result = await classService.deleteClass(req.params.id);
            if (!result) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            res.status(HTTP_STATUS.OK).json({
                message: 'Class deleted successfully',
            });
        } catch (error) {
            // Handle specific error for students in class
            if (
                error.message.includes(
                    'Cannot delete class: There are students assigned to this class'
                )
            ) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json(
                        createErrorResponse(
                            'Cannot delete class: There are students assigned to this class. Please remove all students first.',
                            null,
                            'CLASS_HAS_STUDENTS'
                        )
                    );
            }
            logError('Delete class failed', error, { classId: req.params.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to delete class.',
                    null,
                    'DELETE_CLASS_ERROR'
                )
            );
        }
    },

    async canDeleteClass(req, res) {
        try {
            const result = await classService.canDeleteClass(req.params.id);
            res.json(result);
        } catch (error) {
            logError('Can delete class check failed', error, {
                classId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to check if class can be deleted.',
                    null,
                    'CHECK_DELETE_CLASS_ERROR'
                )
            );
        }
    },

    async getStudentsInClass(req, res) {
        try {
            const classExists = await classService.getClass(req.body.id);
            if (!classExists) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            const Students = await classService.getStudentsInClass(req.body.id);
            if (!Students) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Students not found.',
                            null,
                            'STUDENTS_NOT_FOUND'
                        )
                    );
            }
            res.json(Students);
        } catch (error) {
            logError('Get students in class failed', error, {
                classId: req.body.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve students in class.',
                    null,
                    'GET_STUDENTS_IN_CLASS_ERROR'
                )
            );
        }
    },

    async getClassSchedule(req, res) {
        try {
            const classExists = await classService.getClass(req.body.id);
            if (!classExists) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            const schedules = await classService.getClassSchedule(req.body.id);
            if (!schedules) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Schedules not found.',
                            null,
                            'SCHEDULES_NOT_FOUND'
                        )
                    );
            }
            res.json(schedules);
        } catch (error) {
            logError('Get class schedule failed', error, {
                classId: req.body.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve class schedule.',
                    null,
                    'GET_CLASS_SCHEDULE_ERROR'
                )
            );
        }
    },

    async getClassSubjectsWithTeachers(req, res) {
        try {
            const classId = req.params.id;
            const classExists = await classService.getClass(classId);
            if (!classExists) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json(
                        createErrorResponse(
                            'Class not found.',
                            null,
                            'CLASS_NOT_FOUND'
                        )
                    );
            }
            const data = await classService.getClassSubjectsWithTeachers(
                classId
            );
            res.json(data);
        } catch (error) {
            logError('Get class subjects with teachers failed', error, {
                classId: req.params.id,
            });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                createErrorResponse(
                    'Failed to retrieve class subjects with teachers.',
                    null,
                    'GET_CLASS_SUBJECTS_TEACHERS_ERROR'
                )
            );
        }
    },
};
