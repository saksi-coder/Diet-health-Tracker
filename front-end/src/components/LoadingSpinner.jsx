import "./LoadingSpinner.css";

const LoadingSpinner = ({ text = "Loading...", fullPage = false }) => {
  return (
    <div className={`spinner-container ${fullPage ? "spinner-full-page" : ""}`} role="status" aria-label={text}>
      <div className="spinner">
        <div className="spinner-ring" />
        <div className="spinner-ring spinner-ring-2" />
        <div className="spinner-ring spinner-ring-3" />
      </div>
      <p className="spinner-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
