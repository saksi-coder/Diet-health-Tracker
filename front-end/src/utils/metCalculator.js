/**
 * MET (Metabolic Equivalent of Task) values for various exercises and intensities.
 * MET values sourced from the Compendium of Physical Activities.
 */
const MET_VALUES = {
  Running:  { Low: 7.0,  Medium: 9.8,  High: 12.8 },
  Walking:  { Low: 2.5,  Medium: 3.5,  High: 5.0  },
  Cycling:  { Low: 4.0,  Medium: 6.8,  High: 10.0 },
  Swimming: { Low: 4.5,  Medium: 7.0,  High: 9.8  },
  Gym:      { Low: 3.5,  Medium: 5.0,  High: 8.0  },
  Yoga:     { Low: 2.0,  Medium: 3.0,  High: 4.0  },
  Other:    { Low: 3.0,  Medium: 5.0,  High: 7.0  },
};

/**
 * Estimate calories burned during exercise.
 * Formula: Calories = MET × weight(kg) × duration(hours)
 *
 * @param {string} exerciseType - Type of exercise (e.g., "Running")
 * @param {string} intensity - "Low", "Medium", or "High"
 * @param {number} durationMin - Duration in minutes
 * @param {number} weightKg - User's weight in kilograms
 * @returns {number} Estimated calories burned (rounded to nearest integer)
 */
export const estimateCaloriesBurned = (exerciseType, intensity, durationMin, weightKg) => {
  if (!durationMin || durationMin <= 0 || !weightKg || weightKg <= 0) return 0;

  const type = MET_VALUES[exerciseType] || MET_VALUES.Other;
  const met = type[intensity] || type.Medium;
  const durationHours = durationMin / 60;

  return Math.round(met * weightKg * durationHours);
};

/**
 * Get available exercise types.
 */
export const EXERCISE_TYPES = [
  "Running",
  "Walking",
  "Cycling",
  "Swimming",
  "Gym",
  "Yoga",
  "Other",
];

/**
 * Get available intensity levels.
 */
export const INTENSITY_LEVELS = ["Low", "Medium", "High"];
