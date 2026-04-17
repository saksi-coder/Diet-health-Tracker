import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTodayExercises, addExercise, updateExercise, deleteExercise } from "../api/logsApi";
import { estimateCaloriesBurned, EXERCISE_TYPES, INTENSITY_LEVELS } from "../utils/metCalculator";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import toast from "react-hot-toast";
import "./ExerciseLog.css";

const ExerciseLog = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    exerciseType: "Running",
    duration: "",
    intensity: "Medium",
    caloriesBurned: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const totalDuration = exercises.reduce((sum, e) => sum + (e.duration || 0), 0);
  const totalCalories = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayExercises();
      setExercises(Array.isArray(data) ? data : data?.exercises || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setExercises([]);
      } else {
        setError("Failed to load exercises.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExercises(); }, []);

  // Auto-calculate calories when type, duration, or intensity changes
  useEffect(() => {
    if (formData.duration && Number(formData.duration) > 0) {
      const estimated = estimateCaloriesBurned(
        formData.exerciseType,
        formData.intensity,
        Number(formData.duration),
        user?.weight || 70
      );
      setFormData((prev) => ({ ...prev, caloriesBurned: estimated.toString() }));
    }
  }, [formData.exerciseType, formData.duration, formData.intensity, user?.weight]);

  const resetForm = () => {
    setFormData({ exerciseType: "Running", duration: "", intensity: "Medium", caloriesBurned: "" });
    setFormErrors({});
    setEditingExercise(null);
  };

  const validate = () => {
    const e = {};
    if (!formData.duration || Number(formData.duration) <= 0) e.duration = "Enter a valid duration in minutes";
    if (!formData.caloriesBurned || Number(formData.caloriesBurned) <= 0) e.caloriesBurned = "Enter estimated calories burned";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        exerciseType: formData.exerciseType,
        duration: Number(formData.duration),
        intensity: formData.intensity,
        caloriesBurned: Number(formData.caloriesBurned),
      };
      if (editingExercise) {
        await updateExercise(editingExercise._id || editingExercise.id, payload);
        toast.success("Exercise updated!");
      } else {
        await addExercise(payload);
        toast.success("Exercise logged! 💪");
      }
      resetForm();
      setShowModal(false);
      fetchExercises();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save exercise.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ex) => {
    setEditingExercise(ex);
    setFormData({
      exerciseType: ex.exerciseType || ex.type || "Running",
      duration: ex.duration?.toString() || "",
      intensity: ex.intensity || "Medium",
      caloriesBurned: ex.caloriesBurned?.toString() || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exercise?")) return;
    try {
      await deleteExercise(id);
      toast.success("Exercise deleted.");
      fetchExercises();
    } catch (err) {
      toast.error("Failed to delete exercise.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getIntensityColor = (intensity) => {
    const colors = { Low: "var(--color-info)", Medium: "var(--color-warning)", High: "var(--color-error)" };
    return colors[intensity] || "var(--color-text-muted)";
  };

  if (loading) return <LoadingSpinner fullPage text="Loading exercises..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Exercise Tracker</h1>
        <p>Log your workouts and track calories burned</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchExercises} />}

      {/* Summary Cards */}
      <div className="exercise-summary">
        <div className="exercise-stat-card glass-card animate-slide-up">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          <span className="exercise-stat-value">{totalDuration}</span>
          <span className="exercise-stat-label">minutes</span>
        </div>
        <div className="exercise-stat-card glass-card animate-slide-up">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2"><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0112 18a5 5 0 01-3.5-11.5C9.5 5.5 11 5 12 2z" /></svg>
          <span className="exercise-stat-value">{totalCalories}</span>
          <span className="exercise-stat-label">kcal burned</span>
        </div>
        <div className="exercise-stat-card glass-card animate-slide-up">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          <span className="exercise-stat-value">{exercises.length}</span>
          <span className="exercise-stat-label">workouts</span>
        </div>
      </div>

      {/* Add Button */}
      <div className="section-header">
        <h3>Today's Workouts</h3>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} id="add-exercise-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Exercise
        </button>
      </div>

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <EmptyState title="No exercises logged" message="Add your first workout to get started." />
      ) : (
        <div className="exercise-list">
          {exercises.map((ex) => (
            <div key={ex._id || ex.id} className="exercise-item glass-card animate-fade-in">
              <div className="exercise-item-left">
                <div className="exercise-type-badge">{ex.exerciseType || ex.type}</div>
                <div className="exercise-item-details">
                  <span>{ex.duration} min</span>
                  <span className="exercise-dot">•</span>
                  <span style={{ color: getIntensityColor(ex.intensity) }}>{ex.intensity}</span>
                </div>
              </div>
              <div className="exercise-item-right">
                <div className="exercise-item-calories">
                  <span className="exercise-cal-value">{ex.caloriesBurned}</span>
                  <span className="exercise-cal-unit">kcal</span>
                </div>
                <div className="exercise-item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(ex)} aria-label="Edit exercise">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button className="btn btn-ghost btn-sm meal-delete-btn" onClick={() => handleDelete(ex._id || ex.id)} aria-label="Delete exercise">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingExercise ? "Edit Exercise" : "Log Exercise"}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="ex-type" className="form-label">Exercise Type <span className="required">*</span></label>
            <select id="ex-type" name="exerciseType" className="form-select" value={formData.exerciseType} onChange={handleChange}>
              {EXERCISE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ex-duration" className="form-label">Duration (minutes) <span className="required">*</span></label>
            <input type="number" id="ex-duration" name="duration" className={`form-input ${formErrors.duration ? "error" : ""}`} placeholder="e.g., 30" value={formData.duration} onChange={handleChange} min="1" aria-required="true" />
            {formErrors.duration && <span className="form-error">{formErrors.duration}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="ex-intensity" className="form-label">Intensity <span className="required">*</span></label>
            <select id="ex-intensity" name="intensity" className="form-select" value={formData.intensity} onChange={handleChange}>
              {INTENSITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ex-calories" className="form-label">Est. Calories Burned <span className="required">*</span></label>
            <input type="number" id="ex-calories" name="caloriesBurned" className={`form-input ${formErrors.caloriesBurned ? "error" : ""}`} placeholder="Auto-calculated" value={formData.caloriesBurned} onChange={handleChange} min="1" aria-required="true" />
            {formErrors.caloriesBurned && <span className="form-error">{formErrors.caloriesBurned}</span>}
            <small style={{ color: "var(--color-text-muted)", marginTop: 4 }}>Auto-calculated based on MET values. You can edit it.</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-exercise-btn">
              {submitting ? <><span className="btn-spinner" /> Saving...</> : editingExercise ? "Update" : "Log Exercise"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExerciseLog;
