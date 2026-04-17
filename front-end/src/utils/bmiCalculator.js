/**
 * Calculate BMI from weight (kg) and height (cm).
 * Formula: BMI = weight / (height_in_meters)^2
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Get BMI category label and color based on BMI value.
 */
export const getBMICategory = (bmi) => {
  if (bmi === null || bmi === undefined) {
    return { label: "N/A", color: "#6B6B80", badgeClass: "" };
  }
  if (bmi < 18.5) {
    return { label: "Underweight", color: "#3B82F6", badgeClass: "badge-blue" };
  }
  if (bmi < 25) {
    return { label: "Normal", color: "#22C55E", badgeClass: "badge-green" };
  }
  if (bmi < 30) {
    return { label: "Overweight", color: "#EAB308", badgeClass: "badge-yellow" };
  }
  return { label: "Obese", color: "#EF4444", badgeClass: "badge-red" };
};
