const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};
