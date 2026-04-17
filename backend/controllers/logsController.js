const DailyLog = require("../models/DailyLog");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { calculateBMI } = require("../utils/bmiCalculator");

// Helper Functions
const getToday = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

const findOrCreateLog = async (userId) => {
  const { start, end } = getToday();
  let log = await DailyLog.findOne({
    userId,
    date: { $gte: start, $lte: end },
  });
  if (!log) {
    log = await DailyLog.create({ userId, date: new Date() });
  }
  return log;
};

// 5. GET /api/logs/today
exports.getTodayLog = async (req, res) => {
  try {
    const { start, end } = getToday();
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    });

    const todayISO = new Date().toISOString();

    if (!log) {
      return res.status(200).json({
        date: todayISO,
        totalCalories: 0,
        totalWater: 0,
        totalExerciseDuration: 0,
        totalExerciseCalories: 0,
        weight: null,
      });
    }

    const totalCalories = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalWater = log.waterEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExerciseDuration = log.exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalExerciseCalories = log.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

    res.status(200).json({
      date: log.date.toISOString(),
      totalCalories,
      totalWater,
      totalExerciseDuration,
      totalExerciseCalories,
      weight: log.weight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 6. GET /api/logs?range=7
exports.getLogsRange = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 7;
    const maxRange = Math.min(range, 90);

    // Calculate start date: today minus (range - 1) days, beginning of day UTC
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - (maxRange - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const result = [];
    
    // Create map for easy lookup
    const logsMap = new Map();
    logs.forEach(log => {
      const dateStr = log.date.toISOString().split("T")[0];
      logsMap.set(dateStr, log);
    });

    for (let i = 0; i < maxRange; i++) {
      const currentDate = new Date(startDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      const log = logsMap.get(dateStr);
      
      if (log) {
        const totalCalories = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalWater = log.waterEntries.reduce((sum, entry) => sum + entry.amount, 0);
        
        result.push({
          date: dateStr,
          totalCalories,
          totalWater,
          weight: log.weight,
        });
      } else {
        result.push({
          date: dateStr,
          totalCalories: 0,
          totalWater: 0,
          weight: null,
        });
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 7. GET /api/logs/today/meals
exports.getTodayMeals = async (req, res) => {
  try {
    const log = await findOrCreateLog(req.userId);
    res.status(200).json(log.meals || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 8. POST /api/logs/meals
exports.addMeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { foodName, portion, calories } = req.body;

  try {
    const log = await findOrCreateLog(req.userId);
    const newMeal = { foodName, portion, calories };
    log.meals.push(newMeal);
    await log.save();

    const addedMeal = log.meals[log.meals.length - 1]; // Get newly added meal with _id
    res.status(201).json(addedMeal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 9. PUT /api/logs/meals/:id
exports.updateMeal = async (req, res) => {
  const { foodName, portion, calories } = req.body;

  try {
    const { start, end } = getToday();
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found for today" });
    }

    const meal = log.meals.id(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (foodName !== undefined) meal.foodName = foodName;
    if (portion !== undefined) meal.portion = portion;
    if (calories !== undefined) meal.calories = calories;

    await log.save();
    res.status(200).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 10. DELETE /api/logs/meals/:id
exports.deleteMeal = async (req, res) => {
  try {
    const { start, end } = getToday();
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found for today" });
    }

    const meal = log.meals.id(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    log.meals.pull({ _id: req.params.id });
    await log.save();

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 11. GET /api/logs/today/water
exports.getTodayWater = async (req, res) => {
  try {
    const log = await findOrCreateLog(req.userId);
    const totalWater = log.waterEntries.reduce((sum, entry) => sum + entry.amount, 0);

    res.status(200).json({
      totalWater,
      entries: log.waterEntries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 12. POST /api/logs/water
exports.addWater = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { amount } = req.body;

  try {
    const log = await findOrCreateLog(req.userId);
    log.waterEntries.push({ amount });
    await log.save();

    const addedEntry = log.waterEntries[log.waterEntries.length - 1];
    res.status(201).json(addedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 13. GET /api/logs/today/exercises
exports.getTodayExercises = async (req, res) => {
  try {
    const log = await findOrCreateLog(req.userId);
    res.status(200).json(log.exercises || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 14. POST /api/logs/exercises
exports.addExercise = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { exerciseType, duration, intensity, caloriesBurned } = req.body;

  try {
    const log = await findOrCreateLog(req.userId);
    log.exercises.push({ exerciseType, duration, intensity, caloriesBurned });
    await log.save();

    const addedExercise = log.exercises[log.exercises.length - 1];
    res.status(201).json(addedExercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 15. PUT /api/logs/exercises/:id
exports.updateExercise = async (req, res) => {
  const { exerciseType, duration, intensity, caloriesBurned } = req.body;

  try {
    const { start, end } = getToday();
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found for today" });
    }

    const exercise = log.exercises.id(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    if (exerciseType !== undefined) exercise.exerciseType = exerciseType;
    if (duration !== undefined) exercise.duration = duration;
    if (intensity !== undefined) exercise.intensity = intensity;
    if (caloriesBurned !== undefined) exercise.caloriesBurned = caloriesBurned;

    await log.save();
    res.status(200).json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 16. DELETE /api/logs/exercises/:id
exports.deleteExercise = async (req, res) => {
  try {
    const { start, end } = getToday();
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found for today" });
    }

    const exercise = log.exercises.id(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    log.exercises.pull({ _id: req.params.id });
    await log.save();

    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 17. GET /api/logs/weight/history
exports.getWeightHistory = async (req, res) => {
  try {
    const logs = await DailyLog.find({
      userId: req.userId,
      weight: { $ne: null },
    }).sort({ date: 1 });

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = logs.map(log => {
      let bmi = log.bmi;
      if (bmi === null) {
        bmi = calculateBMI(log.weight, user.height);
      }
      return {
        _id: log._id,
        date: log.date.toISOString().split("T")[0],
        weight: log.weight,
        bmi,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 18. POST /api/logs/weight
exports.addWeight = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { weight } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const calculatedBMI = calculateBMI(weight, user.height);
    const log = await findOrCreateLog(req.userId);

    log.weight = weight;
    log.bmi = calculatedBMI;
    await log.save();

    res.status(201).json({
      _id: log._id,
      date: log.date.toISOString().split("T")[0],
      weight: log.weight,
      bmi: log.bmi,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
