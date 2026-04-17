const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({
      min: 6,
    }),
    check("height", "Height is required and must be a positive number").isFloat({
      gt: 0,
    }),
    check("weight", "Weight is required and must be a positive number").isFloat({
      gt: 0,
    }),
    check("dob", "Valid date of birth is required").isISO8601(),
    check("calorieGoal", "Calorie goal must be a positive number")
      .optional()
      .isFloat({ gt: 0 }),
    check("waterGoal", "Water goal must be a positive number")
      .optional()
      .isFloat({ gt: 0 }),
  ],
  authController.register
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.login
);

module.exports = router;
