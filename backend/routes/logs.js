const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const logsController = require("../controllers/logsController");

// General Logs
router.get("/today", auth, logsController.getTodayLog);
router.get("/", auth, logsController.getLogsRange);

// Meals
router.get("/today/meals", auth, logsController.getTodayMeals);
router.post(
  "/meals",
  [
    auth,
    [
      check("foodName", "Food name is required").not().isEmpty(),
      check("calories", "Calories are required and must be a positive number").isFloat({ min: 0 }),
    ],
  ],
  logsController.addMeal
);
router.put("/meals/:id", auth, logsController.updateMeal);
router.delete("/meals/:id", auth, logsController.deleteMeal);

// Water
router.get("/today/water", auth, logsController.getTodayWater);
router.post(
  "/water",
  [
    auth,
    [check("amount", "Amount is required and must be a positive number").isFloat({ min: 0 })],
  ],
  logsController.addWater
);

// Exercises
router.get("/today/exercises", auth, logsController.getTodayExercises);
router.post(
  "/exercises",
  [
    auth,
    [
      check(
        "exerciseType",
        "Exercise type is required and must be Running, Walking, Cycling, Swimming, Gym, Yoga, or Other"
      )
        .not()
        .isEmpty()
        .isIn(["Running", "Walking", "Cycling", "Swimming", "Gym", "Yoga", "Other"]),
      check("duration", "Duration is required and must be a positive number").isFloat({ min: 0 }),
      check("intensity", "Intensity must be Low, Medium, or High")
        .optional()
        .isIn(["Low", "Medium", "High"]),
      check("caloriesBurned", "Calories burned are required and must be a positive number").isFloat({
        min: 0,
      }),
    ],
  ],
  logsController.addExercise
);
router.put("/exercises/:id", auth, logsController.updateExercise);
router.delete("/exercises/:id", auth, logsController.deleteExercise);

// Weight
router.get("/weight/history", auth, logsController.getWeightHistory);
router.post(
  "/weight",
  [
    auth,
    [check("weight", "Weight is required and must be a positive number").isFloat({ gt: 0 })],
  ],
  logsController.addWeight
);

module.exports = router;
