const Archive = require('../models/Archive');

module.exports = {
    async createArchive(ArchiveData, trx = null) {
        return await Archive.create(ArchiveData, trx);
    },

    async getArchive(id) {
        return await Archive.findById(id);
    },

    async getAllArchives() {
        return await Archive.findAll();
    },

    async updateArchive(id, updates) {
        return await Archive.update(id, updates);
    },

    async deleteArchive(id) {
        return await Archive.delete(id);
    },
};
