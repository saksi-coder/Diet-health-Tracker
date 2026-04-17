const User = require("../models/User");
const { validationResult } = require("express-validator");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -createdAt -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert to regular object to manipulate if needed
    const userProfile = user.toObject();
    
    // Ensure dob is formatted correctly if it exists
    if (userProfile.dob) {
      userProfile.dob = userProfile.dob.toISOString().split('T')[0];
    }
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, height, weight, calorieGoal, waterGoal } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (calorieGoal) user.calorieGoal = calorieGoal;
    if (waterGoal) user.waterGoal = waterGoal;

    await user.save();

    const updatedUser = await User.findById(req.userId).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
