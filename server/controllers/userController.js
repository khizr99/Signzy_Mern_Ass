const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const users = await User.find({ username: { $regex: searchQuery, $options: 'i' } });
    res.json(users);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
