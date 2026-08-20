const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

class Admin extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

Admin.init({
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Admin',
  tableName: 'admins',
  hooks: {
    beforeCreate: async (admin) => {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    },
  }
});

module.exports = Admin;