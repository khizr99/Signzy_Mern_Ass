const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get friend recommendations based on filter
router.get("/recommendations", auth, async (req, res) => {
  try {
    const filter = req.query.filter || "all";
    const currentUser = await User.findById(req.user.id);

    // Get all users except current user and existing friends
    const existingFriendIds = currentUser.friends.map((friend) =>
      friend.toString()
    );
    const existingRequestIds = currentUser.friendRequests.map((request) =>
      request.toString()
    );

    let query = {
      _id: {
        $nin: [req.user.id, ...existingFriendIds, ...existingRequestIds],
      },
    };

    let recommendations = await User.find(query)
      .select("username email interests friends")
      .limit(20);

    // Process recommendations based on filter
    recommendations = recommendations.map((user) => {
      const mutualFriends = currentUser.friends.filter((friendId) =>
        user.friends.includes(friendId)
      );

      const commonInterests = currentUser.interests.filter((interest) =>
        user.interests.includes(interest)
      );

      return {
        ...user.toObject(),
        mutualFriends,
        commonInterests,
      };
    });

    // Sort recommendations based on filter
    switch (filter) {
      case "mutual":
        recommendations.sort(
          (a, b) => b.mutualFriends.length - a.mutualFriends.length
        );
        break;
      case "interests":
        recommendations.sort(
          (a, b) => b.commonInterests.length - a.commonInterests.length
        );
        break;
      default: // 'all'
        recommendations.sort((a, b) => {
          const scoreA = a.mutualFriends.length + a.commonInterests.length;
          const scoreB = b.mutualFriends.length + b.commonInterests.length;
          return scoreB - scoreA;
        });
    }

    res.json({
      success: true,
      data: {
        recommendations,
      },
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching friend recommendations",
    });
  }
});

module.exports = router;
