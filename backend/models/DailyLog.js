const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
  },
  portion: {
    type: String,
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const waterEntrySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const exerciseSchema = new mongoose.Schema({
  exerciseType: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  intensity: {
    type: String,
    enum: ["Low", "Medium", "High"],
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  meals: [mealSchema],
  waterEntries: [waterEntrySchema],
  exercises: [exerciseSchema],
  weight: {
    type: Number,
    default: null,
  },
  bmi: {
    type: Number,
    default: null,
  },
});

// Compound index for unique user-date combination
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyLog", dailyLogSchema);
