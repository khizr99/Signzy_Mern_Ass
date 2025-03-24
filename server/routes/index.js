const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const friendRoutes = require("./friends");
const friendRecommendationsRoutes = require("./friendRecommendations");

router.use("/auth", authRoutes);
router.use("/friends", friendRoutes);
router.use("/friends", friendRecommendationsRoutes);

module.exports = router;
