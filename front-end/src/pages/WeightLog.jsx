import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getWeightHistory, logWeight } from "../api/logsApi";
import { calculateBMI, getBMICategory } from "../utils/bmiCalculator";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "./WeightLog.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const WeightLog = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightError, setWeightError] = useState("");

  const latestWeight = history.length > 0 ? history[history.length - 1].weight : user?.weight;
  const bmi = calculateBMI(latestWeight, user?.height);
  const bmiCategory = getBMICategory(bmi);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeightHistory();
      const entries = Array.isArray(data) ? data : data?.entries || [];
      setHistory(entries);
    } catch (err) {
      if (err.response?.status === 404) {
        setHistory([]);
      } else {
        setError("Failed to load weight history.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || Number(weight) <= 0) {
      setWeightError("Please enter a valid weight in kg");
      return;
    }
    setWeightError("");
    setSubmitting(true);
    try {
      await logWeight({ weight: Number(weight) });
      toast.success("Weight logged! ⚖️");
      setWeight("");
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log weight.");
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: entry.weight,
    bmi: entry.bmi || calculateBMI(entry.weight, user?.height),
  }));

  if (loading) return <LoadingSpinner fullPage text="Loading weight history..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Weight Tracker</h1>
        <p>Monitor your weight and BMI over time</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchHistory} />}

      {/* BMI + Log Section */}
      <div className="weight-top-grid">
        {/* Log Weight */}
        <div className="weight-log-card glass-card animate-slide-up">
          <h3>Log Today's Weight</h3>
          <form onSubmit={handleSubmit} className="weight-log-form" noValidate>
            <div className="form-group">
              <label htmlFor="weight-input" className="form-label">Weight (kg) <span className="required">*</span></label>
              <input
                type="number"
                id="weight-input"
                className={`form-input ${weightError ? "error" : ""}`}
                placeholder="e.g., 72.5"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setWeightError(""); }}
                min="1"
                step="0.1"
                aria-required="true"
              />
              {weightError && <span className="form-error">{weightError}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting} id="log-weight-btn">
              {submitting ? <><span className="btn-spinner" /> Saving...</> : "Log Weight"}
            </button>
          </form>
        </div>

        {/* BMI Card */}
        <div className="weight-bmi-card glass-card animate-slide-up">
          <h3>Your BMI</h3>
          <div className="bmi-display">
            <span className="bmi-value" style={{ color: bmiCategory.color }}>{bmi || "—"}</span>
            {bmi && <span className={`badge ${bmiCategory.badgeClass}`}>{bmiCategory.label}</span>}
          </div>
          <div className="bmi-scale">
            <div className="bmi-scale-bar">
              <div className="bmi-scale-segment" style={{ background: "var(--bmi-underweight)", flex: 18.5 }} />
              <div className="bmi-scale-segment" style={{ background: "var(--bmi-normal)", flex: 6.4 }} />
              <div className="bmi-scale-segment" style={{ background: "var(--bmi-overweight)", flex: 5 }} />
              <div className="bmi-scale-segment" style={{ background: "var(--bmi-obese)", flex: 10 }} />
            </div>
            <div className="bmi-scale-labels">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>
          {latestWeight && (
            <p className="bmi-weight-info">Current weight: <strong>{latestWeight} kg</strong></p>
          )}
        </div>
      </div>

      {/* Weight Chart */}
      <div className="weight-chart glass-card animate-slide-up">
        <h3 className="chart-title">Weight History</h3>
        <p className="chart-subtitle">Your weight trend over time</p>
        {chartData.length > 0 ? (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={3} dot={{ fill: "var(--color-accent)", r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No weight entries" message="Log your weight to see your trend chart." />
        )}
      </div>
    </div>
  );
};

export default WeightLog;
