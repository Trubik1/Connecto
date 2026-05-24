const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Interest = sequelize.define('Interest', {
  status:     { type: DataTypes.STRING, defaultValue: 'pending' }, // ENUM → STRING для SQLite
  fromUserId: { type: DataTypes.INTEGER, allowNull: false },
  toUserId:   { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [
    { fields: ['fromUserId'] },
    { fields: ['toUserId'] },
    { fields: ['fromUserId', 'toUserId', 'status'] },
  ],
});

module.exports = Interest;
