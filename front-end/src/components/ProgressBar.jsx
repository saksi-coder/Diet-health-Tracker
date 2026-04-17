import "./ProgressBar.css";

const ProgressBar = ({ value = 0, max = 100, color, label, showPercentage = true, size = "md" }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const fillColor = color || "var(--color-primary)";

  return (
    <div className={`progress-bar-container progress-bar-${size}`}>
      {label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          {showPercentage && (
            <span className="progress-bar-value">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="progress-bar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label || "Progress"}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${fillColor}, ${fillColor}dd)`,
          }}
        >
          <div className="progress-bar-glow" style={{ background: fillColor }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
