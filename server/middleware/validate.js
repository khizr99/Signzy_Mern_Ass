const { body, validationResult } = require("express-validator");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter"),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array")
    .custom((value) => {
      if (value && !value.every((interest) => typeof interest === "string")) {
        throw new Error("All interests must be strings");
      }
      return true;
    }),

  validate,
];

// Login validation rules
const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
};
