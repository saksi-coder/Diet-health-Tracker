import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api/userApi";
import { calculateBMI, getBMICategory } from "../utils/bmiCalculator";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    height: "",
    weight: "",
    calorieGoal: "",
    waterGoal: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        calorieGoal: data.calorieGoal?.toString() || "",
        waterGoal: data.waterGoal?.toString() || "",
      });
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.height || Number(formData.height) <= 0) e.height = "Enter a valid height";
    if (!formData.weight || Number(formData.weight) <= 0) e.weight = "Enter a valid weight";
    if (!formData.calorieGoal || Number(formData.calorieGoal) <= 0) e.calorieGoal = "Enter a valid calorie goal";
    if (!formData.waterGoal || Number(formData.waterGoal) <= 0) e.waterGoal = "Enter a valid water goal";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        height: Number(formData.height),
        weight: Number(formData.weight),
        calorieGoal: Number(formData.calorieGoal),
        waterGoal: Number(formData.waterGoal),
      };
      const updated = await updateProfile(payload);
      setProfile(updated);
      updateUser({ ...user, ...payload });
      setEditing(false);
      toast.success("Profile updated! ✨");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const bmi = calculateBMI(
    editing ? Number(formData.weight) : (profile?.weight || user?.weight),
    editing ? Number(formData.height) : (profile?.height || user?.height)
  );
  const bmiCategory = getBMICategory(bmi);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  if (loading) return <LoadingSpinner fullPage text="Loading profile..." />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={fetchProfile} /></div>;

  const displayData = profile || user || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and goals</p>
      </div>

      <div className="profile-content">
        {/* Profile Avatar Section */}
        <div className="profile-avatar-section glass-card animate-slide-up">
          <div className="profile-avatar-large">
            {displayData.name ? displayData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h2 className="profile-display-name">{displayData.name || "User"}</h2>
          <p className="profile-email">{displayData.email || ""}</p>
          {displayData.dob && (
            <p className="profile-age">Age: {calculateAge(displayData.dob)} years</p>
          )}

          {/* BMI Display */}
          <div className="profile-bmi">
            <span className="profile-bmi-value" style={{ color: bmiCategory.color }}>{bmi || "—"}</span>
            <span className="profile-bmi-label">BMI</span>
            {bmi && <span className={`badge ${bmiCategory.badgeClass}`}>{bmiCategory.label}</span>}
          </div>
        </div>

        {/* Profile Details / Edit Form */}
        <div className="profile-details glass-card animate-slide-up">
          <div className="profile-details-header">
            <h3>Personal Information</h3>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="profile-name" className="form-label">Full Name <span className="required">*</span></label>
                <input type="text" id="profile-name" name="name" className={`form-input ${formErrors.name ? "error" : ""}`} value={formData.name} onChange={handleChange} aria-required="true" />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label htmlFor="profile-height" className="form-label">Height (cm) <span className="required">*</span></label>
                  <input type="number" id="profile-height" name="height" className={`form-input ${formErrors.height ? "error" : ""}`} value={formData.height} onChange={handleChange} min="1" aria-required="true" />
                  {formErrors.height && <span className="form-error">{formErrors.height}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="profile-weight" className="form-label">Weight (kg) <span className="required">*</span></label>
                  <input type="number" id="profile-weight" name="weight" className={`form-input ${formErrors.weight ? "error" : ""}`} value={formData.weight} onChange={handleChange} min="1" aria-required="true" />
                  {formErrors.weight && <span className="form-error">{formErrors.weight}</span>}
                </div>
              </div>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label htmlFor="profile-calorie-goal" className="form-label">Calorie Goal <span className="required">*</span></label>
                  <input type="number" id="profile-calorie-goal" name="calorieGoal" className={`form-input ${formErrors.calorieGoal ? "error" : ""}`} value={formData.calorieGoal} onChange={handleChange} min="1" aria-required="true" />
                  {formErrors.calorieGoal && <span className="form-error">{formErrors.calorieGoal}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="profile-water-goal" className="form-label">Water Goal (ml) <span className="required">*</span></label>
                  <input type="number" id="profile-water-goal" name="waterGoal" className={`form-input ${formErrors.waterGoal ? "error" : ""}`} value={formData.waterGoal} onChange={handleChange} min="1" aria-required="true" />
                  {formErrors.waterGoal && <span className="form-error">{formErrors.waterGoal}</span>}
                </div>
              </div>
              <div className="profile-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setFormErrors({}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="save-profile-btn">
                  {submitting ? <><span className="btn-spinner" /> Saving...</> : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Height</span>
                <span className="profile-info-value">{displayData.height || "—"} cm</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Weight</span>
                <span className="profile-info-value">{displayData.weight || "—"} kg</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Calorie Goal</span>
                <span className="profile-info-value">{displayData.calorieGoal || "—"} kcal/day</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Water Goal</span>
                <span className="profile-info-value">{displayData.waterGoal || "—"} ml/day</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
