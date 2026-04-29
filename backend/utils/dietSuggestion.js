// utils/dietSuggestion.js

const mealPlans = {
  weightLoss: {
    breakfast: { name: "Oats with fruits", items: ["1 cup oats", "1 banana", "low-fat milk"], calories: 320 },
    lunch:     { name: "Grilled chicken salad", items: ["150g chicken breast", "mixed greens", "olive oil dressing"], calories: 420 },
    dinner:    { name: "Dal with brown rice", items: ["1 cup dal", "1 cup brown rice", "salad"], calories: 480 },
    snacks:    { name: "Light snack", items: ["1 apple", "10 almonds"], calories: 150 },
  },
  weightGain: {
    breakfast: { name: "Eggs and toast", items: ["3 boiled eggs", "2 whole wheat toast", "peanut butter", "banana shake"], calories: 620 },
    lunch:     { name: "Rice with chicken curry", items: ["2 cups rice", "200g chicken curry", "curd"], calories: 780 },
    dinner:    { name: "Paneer with roti", items: ["200g paneer", "3 rotis", "sabzi"], calories: 700 },
    snacks:    { name: "High calorie snack", items: ["handful mixed nuts", "2 dates", "milk"], calories: 350 },
  },
  maintain: {
    breakfast: { name: "Poha with tea", items: ["1.5 cups poha", "1 cup green tea", "1 orange"], calories: 380 },
    lunch:     { name: "Balanced thali", items: ["2 rotis", "1 cup sabzi", "1 cup dal", "salad"], calories: 560 },
    dinner:    { name: "Soup and sandwich", items: ["vegetable soup", "2 whole wheat sandwiches"], calories: 480 },
    snacks:    { name: "Mid-day snack", items: ["1 cup sprouts", "lemon water"], calories: 180 },
  }
};

const getTip = (bmi, avgCalories, calorieGoal) => {
  if (bmi > 25 && avgCalories > calorieGoal)
    return "You are consistently over your calorie goal. Try swapping fried snacks with fruits or nuts.";
  if (bmi < 18.5)
    return "Your BMI is low. Focus on protein-rich foods like eggs, dal, and paneer to build mass.";
  if (avgCalories < calorieGoal - 300)
    return "You are eating well below your goal. Make sure you are not skipping meals.";
  return "Great consistency! Keep logging daily and stay hydrated throughout the day.";
};

const getGoalType = (bmi, calorieGoal, avgCalories) => {
  if (bmi > 25 || avgCalories > calorieGoal + 200) return "weightLoss";
  if (bmi < 18.5 || avgCalories < calorieGoal - 300) return "weightGain";
  return "maintain";
};

const generateDietPlan = (user, logs, preference = "") => {
  const { bmi, calorieGoal } = user;
  const { avgCalories, avgExercise } = logs;

  let goalType = getGoalType(bmi, calorieGoal, avgCalories);

  // Override based on user preference keyword
  if (preference.toLowerCase().includes("lose")) goalType = "weightLoss";
  if (preference.toLowerCase().includes("gain")) goalType = "weightGain";
  if (preference.toLowerCase().includes("maintain")) goalType = "maintain";

  const plan = mealPlans[goalType];
  const totalCalories = Object.values(plan).reduce((sum, meal) => sum + meal.calories, 0);

  return {
    goalType,
    ...plan,
    totalCalories,
    tip: getTip(bmi, avgCalories, calorieGoal)
  };
};

module.exports = { generateDietPlan };
