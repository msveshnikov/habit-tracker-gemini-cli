import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Header = ({ onMenuToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user] = useState({ name: "User", avatar: null }); // Static user for now
  const userMenuRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Placeholder logout logic
    console.log("Logout clicked");
    // Close dropdown after action
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Navigation items - matching App.jsx routes
  const navigationItems = [
    { label: "Dashboard", path: "/" },
    { label: "Habits", path: "/habits" },
    { label: "Daily Tracker", path: "/tracker" },
    { label: "Calendar", path: "/calendar" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          {/* Hamburger menu button to toggle sidebar */}
          <button
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          <div className="logo">
            {/* Use Link for logo to go to dashboard/home */}
            <Link to="/" className="header-logo">
              <h1>HabitTracker</h1>
            </Link>
          </div>
        </div>

        {/* Header navigation - typically shown on larger screens */}
        {/* Note: Primary navigation is in the Sidebar, this might be redundant */}
        {/* Keeping it as per existing structure, but using Link */}
        <nav className="header-nav">
          <ul className="nav-links">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          {/* Notification button - placeholder */}
          <button className="notification-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>

          {/* User menu and dropdown */}
          <div className="user-menu" ref={userMenuRef}>
            <button
              className="user-avatar"
              onClick={toggleDropdown}
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            {isDropdownOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  {/* Re-use avatar placeholder or img if available */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="user-avatar-small"
                    />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.name}</span>
                </div>
                <ul className="dropdown-menu">
                  <li>
                    {/* Use Link for navigation */}
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    {/* Use Link for navigation */}
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
