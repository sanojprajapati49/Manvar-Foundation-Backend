const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
    banner_key: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g., 'hero_slide_1'
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.STRING,
});

module.exports = Banner;
