const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  refId: { type: DataTypes.INTEGER, allowNull: false }, // ID of Event or Story
  refModel: { type: DataTypes.ENUM('Event', 'Story'), allowNull: false }, // Model name
}, { timestamps: true });

module.exports = Comment;
