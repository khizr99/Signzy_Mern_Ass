const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
    if(existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();
    res.status(201).json({ message: 'Friend request sent' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'username');
    res.json(requests);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // action: 'accepted' or 'rejected'
    const request = await FriendRequest.findById(requestId);
    if(!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = action;
    await request.save();

    if(action === 'accepted') {
      // Add each other as friends
      await User.findByIdAndUpdate(request.sender, { $push: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $push: { friends: request.sender } });
    }

    res.json({ message: `Friend request ${action}` });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
