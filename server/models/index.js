const User = require('./User');
const Event = require('./Event');
const Interest = require('./Interest');

Event.hasMany(User, { foreignKey: 'eventId' });
User.belongsTo(Event, { foreignKey: 'eventId' });

Interest.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Interest.belongsTo(User, { as: 'toUser',   foreignKey: 'toUserId' });

module.exports = { User, Event, Interest };
