const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ImpactStat = sequelize.define('ImpactStat', {
    stat_label: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Beneficiaries+'
    stat_value: { type: DataTypes.INTEGER, allowNull: false },
    icon_class: { type: DataTypes.STRING, allowNull: false }, // e.g., 'fas fa-users'
    icon_color: { type: DataTypes.STRING, defaultValue: '#3bbec7' },
    icon_bg_color: { type: DataTypes.STRING, defaultValue: '#e0f7f8' },
},{
    timestamps: false, // इस मॉडल में timestamps की जरूरत नहीं है
    freezeTableName: true, // Sequelize को टेबल का नाम बदलने से रोकें
    tableName: 'impact_stats' // MySQL में टेबल का सही नाम बताएं
});

module.exports = ImpactStat;
