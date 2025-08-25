const attendanceEmployeesService = require('../services/attendanceEmployeesService');

const {  validationResult } = require('express-validator');


module.exports = {

  async createAttendanceEmployees(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      {
          return res.status(400).json({ errors: errors.array() });
      } 
      const {attendance}=req.body;
      const AttendanceEmployees = await attendanceEmployeesService.createAttendancEmployees(attendance);
      res.status(201).json(AttendanceEmployees);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAttendanceEmployees(req, res) {
    try {
      const AttendanceEmployees = await attendanceEmployeesService.getAttendancEmployees(req.params.id);
      if (!AttendanceEmployees) return res.status(404).json({ error: 'Attendance Employees not found' });
      res.json(AttendanceEmployees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllAttendanceEmployees(req, res) {
    try {
      const AttendanceEmployees = await attendanceEmployeesService.getAllAttendancEmployees();
      res.json(AttendanceEmployees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateAttendanceEmployees(req, res) {
    try {
      const AttendanceEmployees = await attendanceEmployeesService.updateAttendancEmployees(req.params.id, req.body);
      if (!AttendanceEmployees||AttendanceEmployees.length==0) return res.status(404).json({ error: 'AttendanceEmployees not found' });
      res.json(AttendanceEmployees);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteAttendanceEmployees(req, res) {
    try {
      const result = await attendanceEmployeesService.deleteAttendancEmployees(req.params.id);
      if (!result) return res.status(404).json({ error: 'Attendance Employees not found' });
      res.status(200).json({message:'deleted successfuly'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

 
};