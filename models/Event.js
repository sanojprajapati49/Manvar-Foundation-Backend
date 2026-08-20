const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  image: DataTypes.STRING,
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

module.exports = Event;
