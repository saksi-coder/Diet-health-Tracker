import "./MetricCard.css";

const MetricCard = ({ title, value, unit, icon, badge, badgeClass, color, children }) => {
  return (
    <div className="metric-card glass-card animate-slide-up">
      <div className="metric-card-header">
        <div className="metric-card-icon" style={color ? { color } : {}}>
          {icon}
        </div>
        {badge && (
          <span className={`badge ${badgeClass || ""}`}>{badge}</span>
        )}
      </div>
      <div className="metric-card-body">
        <p className="metric-card-title">{title}</p>
        <div className="metric-card-value-row">
          <span className="metric-card-value" style={color ? { color } : {}}>
            {value !== undefined && value !== null ? value : "—"}
          </span>
          {unit && <span className="metric-card-unit">{unit}</span>}
        </div>
      </div>
      {children && <div className="metric-card-footer">{children}</div>}
    </div>
  );
};

export default MetricCard;
