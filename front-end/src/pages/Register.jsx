import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    weight: "",
    dob: "",
    calorieGoal: "",
    waterGoal: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required";
    if (!formData.email.trim()) {
      e.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      e.password = "Password is required";
    } else if (formData.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    if (!formData.height || Number(formData.height) <= 0) {
      e.height = "Please enter a valid height in cm";
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      e.weight = "Please enter a valid weight in kg";
    }
    if (!formData.dob) e.dob = "Date of birth is required";
    if (!formData.calorieGoal || Number(formData.calorieGoal) <= 0) {
      e.calorieGoal = "Please set a valid daily calorie goal";
    }
    if (!formData.waterGoal || Number(formData.waterGoal) <= 0) {
      e.waterGoal = "Please set a valid daily water goal in ml";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        calorieGoal: Number(formData.calorieGoal),
        waterGoal: Number(formData.waterGoal),
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, type, placeholder, extra) => (
    <div className="form-group" key={name}>
      <label htmlFor={`reg-${name}`} className="form-label">
        {label} <span className="required">*</span>
      </label>
      <input
        type={type}
        id={`reg-${name}`}
        name={name}
        className={`form-input ${errors[name] ? "error" : ""}`}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        aria-required="true"
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `reg-${name}-error` : undefined}
        {...extra}
      />
      {errors[name] && <span className="form-error" id={`reg-${name}-error`}>{errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-container animate-slide-up" style={{ maxWidth: "540px" }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your health tracking journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="form-error-banner">{errors.general}</div>
          )}

          {renderField("name", "Full Name", "text", "John Doe")}

          <div className="auth-form-grid">
            {renderField("email", "Email", "email", "you@example.com")}
            {renderField("password", "Password", "password", "Min. 6 characters")}
          </div>

          <div className="auth-form-grid">
            {renderField("height", "Height (cm)", "number", "175", { min: 1 })}
            {renderField("weight", "Weight (kg)", "number", "70", { min: 1 })}
          </div>

          {renderField("dob", "Date of Birth", "date", "")}

          <div className="auth-form-grid">
            {renderField("calorieGoal", "Daily Calorie Goal", "number", "2000", { min: 1 })}
            {renderField("waterGoal", "Daily Water Goal (ml)", "number", "2500", { min: 1 })}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" id="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
