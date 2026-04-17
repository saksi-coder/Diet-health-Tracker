import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await login(formData.email, formData.password);
      toast.success("Welcome back! 🎉");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue tracking your health</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="form-error-banner">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="login-email"
              name="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && <span className="form-error" id="login-email-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="login-password"
              name="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error" id="login-password-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" id="register-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
