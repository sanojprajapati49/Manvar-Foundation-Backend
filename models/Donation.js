const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Donation = sequelize.define('Donation', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  pan: DataTypes.STRING,
  address: DataTypes.STRING,
  country: DataTypes.STRING,
  state: DataTypes.STRING,
  district: DataTypes.STRING,
  pincode: DataTypes.STRING,
  frequency: { type: DataTypes.STRING, defaultValue: 'One time' },
  razorpay_payment_id: { type: DataTypes.STRING, allowNull: false },
  razorpay_order_id: { type: DataTypes.STRING, allowNull: false },
  razorpay_signature: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

module.exports = Donation;
