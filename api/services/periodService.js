const Period= require('../models/Period');

module.exports = {
  async createPeriod(PeriodData) {
    return await Period.create(PeriodData);
  },

  async getPeriod(id) {
    return await Period.findById(id);
  },

  async getAllPeriods() {
    return await Period.findAll();
  },

  async updatePeriod(id, updates) {
    return await Period.update(id, updates);
  },

  async deletePeriod(id) {
    return await Period.delete(id);
  }
};