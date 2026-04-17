import "./ErrorMessage.css";

const ErrorMessage = ({ message = "Something went wrong. Please try again.", onRetry }) => {
  return (
    <div className="error-message animate-fade-in" role="alert">
      <div className="error-message-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div className="error-message-content">
        <p className="error-message-text">{message}</p>
        {onRetry && (
          <button className="btn btn-secondary btn-sm" onClick={onRetry} id="retry-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
