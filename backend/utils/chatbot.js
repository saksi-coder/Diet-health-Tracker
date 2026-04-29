// utils/chatbot.js

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal";
  if (bmi < 30)   return "Overweight";
  return "Obese";
};

const rules = [
  {
    keywords: ["bmi", "body mass"],
    reply: (ctx) => `Your current BMI is ${ctx.bmi}, which falls in the "${getBMICategory(ctx.bmi)}" category. ${ctx.bmi > 25 ? "Try to increase physical activity and reduce calorie intake." : ctx.bmi < 18.5 ? "Focus on eating more protein-rich foods." : "You are in a healthy range — keep it up!"}`
  },
  {
    keywords: ["calorie", "calories", "eating", "food"],
    reply: (ctx) => `Today you have consumed ${ctx.todayCalories} kcal out of your ${ctx.calorieGoal} kcal goal. ${ctx.todayCalories > ctx.calorieGoal ? "You have exceeded your goal — consider a light dinner." : "You still have " + (ctx.calorieGoal - ctx.todayCalories) + " kcal remaining for today."}`
  },
  {
    keywords: ["water", "hydration", "drink"],
    reply: (ctx) => `You have logged ${ctx.todayWater} ml of water today. ${ctx.todayWater < 2000 ? "Try to drink at least 2000 ml daily. Keep a water bottle nearby!" : "Great hydration today! Keep it up."}`
  },
  {
    keywords: ["exercise", "workout", "activity", "steps"],
    reply: (ctx) => `You have logged ${ctx.todayExercise} minutes of exercise today. ${ctx.todayExercise === 0 ? "No activity logged yet — even a 20 minute walk helps!" : ctx.todayExercise < 30 ? "Good start! Try to reach at least 30 minutes daily." : "Excellent work on staying active today!"}`
  },
  {
    keywords: ["weight", "heavy", "light"],
    reply: (ctx) => `Your logged weight is ${ctx.weight} kg. Track your weight daily for the best trend analysis on your dashboard.`
  },
  {
    keywords: ["diet", "meal", "plan", "suggest"],
    reply: () => `Click the "Get Diet Plan" button on your dashboard to get a personalized meal plan based on your health data!`
  },
  {
    keywords: ["log", "how to", "track", "add"],
    reply: () => `You can log meals, water, and exercise from the dashboard. Just click the "+" button next to each section to add an entry.`
  },
  {
    keywords: ["goal", "target"],
    reply: (ctx) => `Your current daily calorie goal is ${ctx.calorieGoal} kcal. You can update your goals anytime from your Profile settings.`
  },
  {
    keywords: ["hello", "hi", "hey", "start"],
    reply: (ctx) => `Hi ${ctx.name ? ctx.name.split(" ")[0] : "there"}! I am your wellness assistant. You can ask me about your calories, water intake, BMI, exercise, or diet plan. How can I help you today?`
  },
  {
    keywords: ["thanks", "thank you", "great", "awesome"],
    reply: () => `You are welcome! Stay consistent and keep tracking — small daily habits lead to big results!`
  },
];

const getReply = (message, userContext) => {
  const msg = message.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some(k => msg.includes(k))) {
      return rule.reply(userContext);
    }
  }
  return "I am not sure about that. Try asking about your BMI, calories, water intake, exercise, or diet plan!";
};

module.exports = { getReply };
