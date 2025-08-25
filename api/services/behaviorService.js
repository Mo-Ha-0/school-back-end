const Behavior = require('../models/Behavior');

module.exports = {
    async createBehavior(behaviorData) {
        return await Behavior.create(behaviorData);
    },

    async getBehavior(id) {
        return await Behavior.findById(id);
    },

    async getAllBehaviors() {
        return await Behavior.findAll();
    },

    async updateBehavior(id, updates) {
        return await Behavior.update(id, updates);
    },

    async deleteBehavior(id) {
        return await Behavior.delete(id);
    },

    async getBehaviorsByStudentId(studentId) {
        return await Behavior.findByStudentId(studentId);
    },
};
