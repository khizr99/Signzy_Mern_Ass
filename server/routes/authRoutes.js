const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validate");

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/profile", auth, getProfile);

module.exports = router;
