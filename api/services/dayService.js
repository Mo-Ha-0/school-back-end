const Day= require('../models/Day');

module.exports = {
  async createDay(DayData) {
    return await Day.create(DayData);
  },

  async getDay(id) {
    return await Day.findById(id);
  },

  async getAllDays() {
    return await Day.findAll();
  },

  async updateDay(id, updates) {
    return await Day.update(id, updates);
  },

  async deleteDay(id) {
    return await Day.delete(id);
  }
};