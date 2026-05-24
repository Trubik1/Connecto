const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Event = sequelize.define('Event', {
  title:       { type: DataTypes.STRING,  allowNull: false },
  start_date:  { type: DataTypes.DATEONLY, allowNull: false },
  end_date:    { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT },
  tags:        { type: DataTypes.JSON,    defaultValue: [] }, // ARRAY → JSON для совместимости с SQLite
  organizerId:{ type: DataTypes.STRING,  allowNull: false },
  qrCode:     { type: DataTypes.STRING,  defaultValue: () => require('crypto').randomUUID() },
  accessCode: { type: DataTypes.STRING,  allowNull: false },
  duration_days: { type: DataTypes.INTEGER, defaultValue: 1 },
  expires_at: { type: DataTypes.DATE },
}, {
  tableName: 'events',
  freezeTableName: true,
});

module.exports = Event;
