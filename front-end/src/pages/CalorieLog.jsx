import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTodayMeals, addMeal, updateMeal, deleteMeal } from "../api/logsApi";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import toast from "react-hot-toast";
import "./CalorieLog.css";

const CalorieLog = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ foodName: "", portion: "", calories: "" });
  const [formErrors, setFormErrors] = useState({});

  const calorieGoal = user?.calorieGoal || 2000;
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayMeals();
      setMeals(Array.isArray(data) ? data : data?.meals || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setMeals([]);
      } else {
        setError("Failed to load meals. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeals(); }, []);

  const resetForm = () => {
    setFormData({ foodName: "", portion: "", calories: "" });
    setFormErrors({});
    setEditingMeal(null);
  };

  const validate = () => {
    const e = {};
    if (!formData.foodName.trim()) e.foodName = "Food name is required";
    if (!formData.calories || Number(formData.calories) <= 0) e.calories = "Enter a valid calorie count";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        foodName: formData.foodName.trim(),
        portion: formData.portion.trim(),
        calories: Number(formData.calories),
      };
      if (editingMeal) {
        await updateMeal(editingMeal._id || editingMeal.id, payload);
        toast.success("Meal updated!");
      } else {
        await addMeal(payload);
        toast.success("Meal added! 🍽️");
      }
      resetForm();
      setShowModal(false);
      fetchMeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save meal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      foodName: meal.foodName || meal.name || "",
      portion: meal.portion || "",
      calories: meal.calories?.toString() || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meal?")) return;
    try {
      await deleteMeal(id);
      toast.success("Meal deleted.");
      fetchMeals();
    } catch (err) {
      toast.error("Failed to delete meal.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  if (loading) return <LoadingSpinner fullPage text="Loading meals..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Calorie Tracker</h1>
        <p>Track your daily food intake</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMeals} />}

      {/* Daily Summary */}
      <div className="calorie-summary glass-card animate-slide-up">
        <div className="calorie-summary-info">
          <div className="calorie-summary-numbers">
            <span className="calorie-consumed">{totalCalories}</span>
            <span className="calorie-separator">/</span>
            <span className="calorie-goal">{calorieGoal} kcal</span>
          </div>
          <p className="calorie-remaining">
            {totalCalories < calorieGoal
              ? `${calorieGoal - totalCalories} kcal remaining`
              : `${totalCalories - calorieGoal} kcal over goal`}
          </p>
        </div>
        <ProgressBar value={totalCalories} max={calorieGoal} color={totalCalories > calorieGoal ? "var(--color-error)" : "var(--color-primary)"} size="md" />
      </div>

      {/* Add Button */}
      <div className="section-header">
        <h3>Today's Meals</h3>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} id="add-meal-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Meal
        </button>
      </div>

      {/* Meals List */}
      {meals.length === 0 ? (
        <EmptyState title="No meals logged yet" message="Add your first meal to start tracking calories." />
      ) : (
        <div className="meals-list">
          {meals.map((meal) => (
            <div key={meal._id || meal.id} className="meal-item glass-card animate-fade-in">
              <div className="meal-info">
                <h4 className="meal-name">{meal.foodName || meal.name}</h4>
                {meal.portion && <span className="meal-portion">{meal.portion}</span>}
              </div>
              <div className="meal-calories">
                <span className="meal-cal-value">{meal.calories}</span>
                <span className="meal-cal-unit">kcal</span>
              </div>
              <div className="meal-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(meal)} aria-label="Edit meal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn btn-ghost btn-sm meal-delete-btn" onClick={() => handleDelete(meal._id || meal.id)} aria-label="Delete meal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingMeal ? "Edit Meal" : "Add Meal"}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="meal-food-name" className="form-label">Food Name <span className="required">*</span></label>
            <input type="text" id="meal-food-name" name="foodName" className={`form-input ${formErrors.foodName ? "error" : ""}`} placeholder="e.g., Grilled Chicken Salad" value={formData.foodName} onChange={handleChange} aria-required="true" />
            {formErrors.foodName && <span className="form-error">{formErrors.foodName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="meal-portion" className="form-label">Portion</label>
            <input type="text" id="meal-portion" name="portion" className="form-input" placeholder="e.g., 1 bowl, 200g" value={formData.portion} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="meal-calories" className="form-label">Calories <span className="required">*</span></label>
            <input type="number" id="meal-calories" name="calories" className={`form-input ${formErrors.calories ? "error" : ""}`} placeholder="e.g., 350" value={formData.calories} onChange={handleChange} min="1" aria-required="true" />
            {formErrors.calories && <span className="form-error">{formErrors.calories}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-meal-btn">
              {submitting ? <><span className="btn-spinner" /> Saving...</> : editingMeal ? "Update Meal" : "Add Meal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalorieLog;
