import { useState } from "react";
import { getDietPlan } from "../api/aiApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";
import "./DietPlan.css";

const goalLabels = {
  weightLoss: { label: "Weight Loss", emoji: "🔥", desc: "Focus on calorie deficit with nutrient-dense foods" },
  weightGain: { label: "Weight Gain", emoji: "💪", desc: "High-protein, calorie-surplus meals to build mass" },
  maintain:   { label: "Maintenance", emoji: "⚖️", desc: "Balanced nutrition to sustain your current weight" },
};

const mealMeta = {
  breakfast: { emoji: "🌅", label: "Breakfast" },
  lunch:     { emoji: "☀️", label: "Lunch" },
  dinner:    { emoji: "🌙", label: "Dinner" },
  snacks:    { emoji: "🍎", label: "Snacks" },
};

const DietPlan = () => {
  const [preference, setPreference] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDietPlan(preference);
      if (data.success) {
        setPlan(data.plan);
        toast.success("Diet plan generated!");
      }
    } catch (err) {
      setError("Could not generate diet plan. Please try again.");
      toast.error("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const goalInfo = plan ? goalLabels[plan.goalType] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🥗 Diet Suggestion</h1>
        <p>Get a personalized meal plan based on your health data</p>
      </div>

      {/* Controls */}
      <div className="diet-plan-controls">
        <div className="form-group">
          <label className="form-label">Preference (optional)</label>
          <select
            className="form-select"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            id="diet-preference-select"
          >
            <option value="">Auto (based on your data)</option>
            <option value="lose weight">I want to lose weight</option>
            <option value="gain weight">I want to gain weight</option>
            <option value="maintain weight">I want to maintain weight</option>
          </select>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={fetchPlan}
          disabled={loading}
          id="generate-diet-btn"
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Generating...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0112 18a5 5 0 01-3.5-11.5C9.5 5.5 11 5 12 2z" />
              </svg>
              Get Diet Plan
            </>
          )}
        </button>
      </div>

      {loading && <LoadingSpinner text="Analyzing your health data..." />}
      {error && <ErrorMessage message={error} onRetry={fetchPlan} />}

      {plan && !loading && (
        <>
          {/* Goal Banner */}
          <div className={`diet-goal-banner ${plan.goalType}`}>
            <div className="diet-goal-icon">{goalInfo.emoji}</div>
            <div className="diet-goal-info">
              <h3>{goalInfo.label} Plan</h3>
              <p>{goalInfo.desc}</p>
            </div>
          </div>

          {/* Meal Cards */}
          <div className="meal-grid">
            {Object.entries(mealMeta).map(([key, meta]) => {
              const meal = plan[key];
              if (!meal) return null;
              return (
                <div className={`meal-card glass-card ${key}`} key={key} id={`meal-${key}`}>
                  <div className="meal-header">
                    <div className="meal-type">
                      <span className="meal-emoji">{meta.emoji}</span>
                      <span className="meal-label">{meta.label}</span>
                    </div>
                    <span className="meal-calories">{meal.calories} kcal</span>
                  </div>
                  <h4 className="meal-name">{meal.name}</h4>
                  <div className="meal-items">
                    {meal.items.map((item, i) => (
                      <div className="meal-item" key={i}>{item}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Calories */}
          <div className="diet-total">
            <span className="diet-total-label">Total Daily Calories</span>
            <span className="diet-total-value">{plan.totalCalories} kcal</span>
          </div>

          {/* Tip */}
          {plan.tip && (
            <div className="diet-tip">
              <span className="diet-tip-icon">💡</span>
              <p className="diet-tip-text">
                <strong>Health Tip: </strong>
                {plan.tip}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DietPlan;
