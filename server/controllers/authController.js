const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AppError, handleMongoError } = require("../middleware/errorHandler");

const SECRET = "your_jwt_secret"; // In production, use environment variables

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { username, email, password, interests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new AppError(
        "User with this email or username already exists",
        400
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      interests: interests || [],
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      data: {
        user: user.getProfile(),
        token,
      },
    });
  } catch (error) {
    next(handleMongoError(error));
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      status: "success",
      data: {
        user: user.getProfile(),
        token,
      },
    });
  } catch (error) {
    next(handleMongoError(error));
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    res.json({
      status: "success",
      data: {
        user: req.user.getProfile(),
      },
    });
  } catch (error) {
    next(handleMongoError(error));
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
