const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

class User extends Model {
  // Password (PIN) को मैच करें
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init({
  name: { type: DataTypes.STRING, allowNull: false }, 
  email: { type: DataTypes.STRING, allowNull: false }, // unique: true यहाँ से हटाया गया
  mobileNo: { type: DataTypes.STRING, allowNull: false }, // unique: true यहाँ से हटाया गया
  password: { type: DataTypes.STRING, allowNull: false }, // This will be the PIN
  role: { type: DataTypes.STRING, defaultValue: 'Volunteer' }, // Volunteer, Intern, Admin etc.
  volunteer_id: { type: DataTypes.STRING }, // unique: true यहाँ से भी हटाया गया
  fatherName: DataTypes.STRING,
  gender: DataTypes.STRING,
  dob: DataTypes.DATE,
  occupation: DataTypes.STRING,
  address: DataTypes.STRING,
  state: DataTypes.STRING,
  district: DataTypes.STRING,
  pincode: DataTypes.STRING,
  aadhaar: DataTypes.STRING,
  interest: DataTypes.STRING,
  availableTime: DataTypes.STRING,
  skills: DataTypes.STRING,
  experience: DataTypes.STRING,
  emergencyName: DataTypes.STRING,
  emergencyRelation: DataTypes.STRING,
  emergencyPhone: DataTypes.STRING,
  join_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  }, // hooks ऑब्जेक्ट यहाँ बंद होता है
  indexes: [ // indexes ऐरे यहाँ से शुरू होता है
    {
      unique: true,
      fields: ['email'],
      name: 'unique_email_index'
    },
    {
      unique: true,
      fields: ['mobileNo'],
      name: 'unique_mobileNo_index'
    },
    {
      unique: true,
      fields: ['volunteer_id'],
      name: 'unique_volunteer_id_index'
    }
  ]
});

module.exports = User;
