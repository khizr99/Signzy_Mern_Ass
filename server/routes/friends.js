const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all friends
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "username email interests"
    );
    res.json({
      success: true,
      data: {
        friends: user.friends,
      },
    });
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching friends",
    });
  }
});

// Send friend request
router.post("/request/:userId", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user",
      });
    }

    // Check if request already sent
    if (targetUser.friendRequests.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    // Add to friend requests
    targetUser.friendRequests.push(req.user.id);
    await targetUser.save();

    res.json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({
      success: false,
      message: "Error sending friend request",
    });
  }
});

// Accept friend request
router.post("/accept/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sender = await User.findById(req.params.userId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if request exists
    if (!user.friendRequests.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "No friend request from this user",
      });
    }

    // Remove from requests and add to friends
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    user.friends.push(req.params.userId);
    sender.friends.push(req.user.id);

    await Promise.all([user.save(), sender.save()]);

    res.json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({
      success: false,
      message: "Error accepting friend request",
    });
  }
});

// Reject friend request
router.post("/reject/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if request exists
    if (!user.friendRequests.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "No friend request from this user",
      });
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    await user.save();

    res.json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    res.status(500).json({
      success: false,
      message: "Error rejecting friend request",
    });
  }
});

// Remove friend
router.delete("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.userId);

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      });
    }

    // Remove from both users' friends lists
    user.friends = user.friends.filter(
      (id) => id.toString() !== req.params.userId
    );
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== req.user.id
    );

    await Promise.all([user.save(), friend.save()]);

    res.json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({
      success: false,
      message: "Error removing friend",
    });
  }
});

module.exports = router;
