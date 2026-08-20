const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Media = sequelize.define('Media', {
    title: { type: DataTypes.STRING, allowNull: false },
    publisher: DataTypes.STRING,
    date: DataTypes.DATE,
    image: DataTypes.STRING, // Paper cutting image
    link: DataTypes.STRING, // Link to online article
}, { timestamps: true });

module.exports = Media;
