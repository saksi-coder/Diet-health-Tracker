import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Don't show navbar on auth pages
  if (!isAuthenticated) return null;

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/dashboard": "Dashboard",
      "/log/calories": "Calorie Tracker",
      "/log/water": "Hydration Tracker",
      "/log/exercise": "Exercise Tracker",
      "/log/weight": "Weight Tracker",
      "/profile": "My Profile",
    };
    return titles[path] || "Diet & Health Tracker";
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-left">
        <button
          className="navbar-hamburger btn-ghost"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar navigation"
          id="sidebar-toggle"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="navbar-title">{getPageTitle()}</h2>
      </div>

      <div className="navbar-right">
        <Link to="/profile" className="navbar-user" id="navbar-profile-link">
          <div className="navbar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="navbar-username">{user?.name || "User"}</span>
        </Link>
        <button
          className="btn btn-ghost navbar-logout"
          onClick={logout}
          aria-label="Logout"
          id="logout-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
