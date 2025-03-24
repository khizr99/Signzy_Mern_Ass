const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Register user
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("interests").isArray().withMessage("Interests must be an array"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors.array(),
        });
      }

      const { username, email, password, interests } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Create new user
      user = new User({
        username,
        email,
        password,
        interests,
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user
      await user.save();

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            data: {
              token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                interests: user.interests,
              },
            },
          });
        }
      );
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            data: {
              token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                interests: user.interests,
              },
            },
          });
        }
      );
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
