const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Story = sequelize.define('Story', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  url: DataTypes.STRING, // For image or video URL
  type: { type: DataTypes.ENUM('image', 'video'), defaultValue: 'image' },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

  module.exports = Story;
