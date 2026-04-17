const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

router.get("/profile", auth, userController.getProfile);

router.put(
  "/profile",
  [
    auth,
    [
      check("name", "Name is required").not().isEmpty(),
      check("height", "Height is required and must be a positive number").isFloat({
        gt: 0,
      }),
      check("weight", "Weight is required and must be a positive number").isFloat({
        gt: 0,
      }),
      check("calorieGoal", "Calorie goal must be a positive number").isFloat({
        gt: 0,
      }),
      check("waterGoal", "Water goal must be a positive number").isFloat({
        gt: 0,
      }),
    ],
  ],
  userController.updateProfile
);

module.exports = router;
