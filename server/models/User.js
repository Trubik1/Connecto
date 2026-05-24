const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  firstName:  { type: DataTypes.STRING,  allowNull: false },
  middleName: { type: DataTypes.STRING },
  age:        { type: DataTypes.INTEGER },
  profession: { type: DataTypes.STRING },
  hobbies:    { type: DataTypes.JSON,   defaultValue: [] },   // ARRAY → JSON для SQLite
  contact:    { type: DataTypes.STRING, allowNull: false, unique: true },
  eventId:    { type: DataTypes.INTEGER },
  isGuest:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'users',
  freezeTableName: true,
});

User.addHook('afterFind', (users) => {
  const addVirtualFields = (user) => {
    if (user) {
      user.name   = user.firstName;
      user.role   = user.profession;
      user.tags   = user.hobbies;
    }
  };
  if (Array.isArray(users)) users.forEach(addVirtualFields);
  else addVirtualFields(users);
});

module.exports = User;
