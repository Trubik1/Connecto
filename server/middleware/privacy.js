const { Interest } = require('../models');

const filterContacts = async (userId, targetUser) => {
  if (!userId || targetUser.id === parseInt(userId)) return targetUser.toJSON ? targetUser.toJSON() : targetUser;
  const mutual = await Interest.findOne({
    where: {
      fromUserId: userId,
      toUserId: targetUser.id,
      status: 'accepted',
    },
  });
  const userJson = targetUser.toJSON ? targetUser.toJSON() : { ...targetUser };
  if (!mutual) {
    delete userJson.contact;
  }
  return userJson;
};

module.exports = { filterContacts };