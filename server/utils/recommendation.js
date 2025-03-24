const User = require('../models/User');

exports.recommendFriends = async (userId) => {
  const user = await User.findById(userId).populate('friends');
  let recommendations = {};
  user.friends.forEach(friend => {
    friend.friends.forEach(mutualId => {
      if(!user.friends.includes(mutualId) && !mutualId.equals(user._id)) {
        recommendations[mutualId] = (recommendations[mutualId] || 0) + 1;
      }
    });
  });
  return Object.entries(recommendations)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
};
