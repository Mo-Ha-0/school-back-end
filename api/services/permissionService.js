const Permission = require('../models/Permission');

module.exports = {
  async createPermission(PermissionData) {
    return await Permission.create(PermissionData);
  },

 

  async getAllPermissions() {
    return await Permission.findAll();
  },

 
};
