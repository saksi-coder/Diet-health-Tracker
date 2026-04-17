import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTodayWater, addWater } from "../api/logsApi";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";
import "./WaterLog.css";

const GLASS_SIZE = 250; // ml per glass

const WaterLog = () => {
  const { user } = useAuth();
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [unit, setUnit] = useState("ml"); // "ml" or "glasses"

  const waterGoal = user?.waterGoal || 2500;
  const currentIntake = waterData?.totalWater || waterData?.amount || 0;
  const percentage = waterGoal > 0 ? Math.min((currentIntake / waterGoal) * 100, 100) : 0;
  const remaining = Math.max(waterGoal - currentIntake, 0);

  const fetchWater = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayWater();
      setWaterData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setWaterData({ totalWater: 0 });
      } else {
        setError("Failed to load water intake data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWater(); }, []);

  const handleAddWater = async (amountMl) => {
    if (amountMl <= 0) return;
    setSubmitting(true);
    try {
      await addWater({ amount: amountMl });
      toast.success(`Added ${amountMl}ml of water 💧`);
      setCustomAmount("");
      fetchWater();
    } catch (err) {
      toast.error("Failed to log water intake.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    const ml = unit === "glasses" ? amount * GLASS_SIZE : amount;
    handleAddWater(ml);
  };

  if (loading) return <LoadingSpinner fullPage text="Loading hydration data..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Hydration Tracker</h1>
        <p>Stay hydrated throughout the day</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchWater} />}

      <div className="water-content">
        {/* Water Bottle Visual */}
        <div className="water-visual glass-card animate-slide-up">
          <div className="water-bottle">
            <div className="water-bottle-body">
              <div
                className="water-bottle-fill"
                style={{ "--fill-height": `${percentage}%` }}
              >
                <div className="water-bubble water-bubble-1" />
                <div className="water-bubble water-bubble-2" />
                <div className="water-bubble water-bubble-3" />
              </div>
              <div className="water-bottle-marks">
                {[25, 50, 75].map((mark) => (
                  <div key={mark} className="water-bottle-mark" style={{ bottom: `${mark}%` }}>
                    <span>{Math.round(waterGoal * mark / 100)}ml</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="water-percentage">{Math.round(percentage)}%</div>
          </div>

          <div className="water-stats">
            <div className="water-stat">
              <span className="water-stat-value">{currentIntake}</span>
              <span className="water-stat-label">ml consumed</span>
            </div>
            <div className="water-stat">
              <span className="water-stat-value">{remaining}</span>
              <span className="water-stat-label">ml remaining</span>
            </div>
          </div>

          <ProgressBar value={currentIntake} max={waterGoal} color="var(--color-info)" label="Daily Progress" size="lg" />
        </div>

        {/* Water Input */}
        <div className="water-controls glass-card animate-slide-up">
          <h3>Quick Add</h3>
          <div className="water-quick-buttons">
            {[100, 250, 500, 750].map((amount) => (
              <button
                key={amount}
                className="btn btn-secondary water-quick-btn"
                onClick={() => handleAddWater(amount)}
                disabled={submitting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l-5.5 9A6.5 6.5 0 0012 22a6.5 6.5 0 005.5-11L12 2z" /></svg>
                {amount}ml
              </button>
            ))}
          </div>

          <div className="water-custom-section">
            <h4>Custom Amount</h4>
            <div className="water-unit-toggle">
              <button className={`btn btn-sm ${unit === "ml" ? "btn-primary" : "btn-secondary"}`} onClick={() => setUnit("ml")}>ml</button>
              <button className={`btn btn-sm ${unit === "glasses" ? "btn-primary" : "btn-secondary"}`} onClick={() => setUnit("glasses")}>Glasses ({GLASS_SIZE}ml)</button>
            </div>
            <form onSubmit={handleCustomSubmit} className="water-custom-form">
              <input
                type="number"
                className="form-input"
                placeholder={unit === "ml" ? "Enter ml" : "Number of glasses"}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                id="custom-water-input"
                aria-label={`Water amount in ${unit}`}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting} id="add-water-btn">
                {submitting ? <span className="btn-spinner" /> : "Add"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLog;
