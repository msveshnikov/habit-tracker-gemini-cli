import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: '📊'
    },
    {
      id: 'habits',
      label: 'Habits',
      path: '/habits',
      icon: '✅'
    },
    {
      id: 'tracker',
      label: 'Daily Tracker',
      path: '/tracker',
      icon: '📅'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/calendar',
      icon: '🗓️'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: '📈'
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className={`sidebar-title ${isCollapsed ? 'hidden' : ''}`}>
          HabitTracker
        </h2>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className={`user-info ${isCollapsed ? 'hidden' : ''}`}>
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="user-name">User</span>
            <span className="user-status">Active</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
        }

        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          transition: opacity 0.3s ease;
        }

        .sidebar-title.hidden {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          color: #6b7280;
          font-size: 1rem;
          transition: background-color 0.2s ease;
        }

        .sidebar-toggle:hover {
          background-color: #f3f4f6;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          margin-bottom: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 0.375rem;
          margin: 0 0.5rem;
        }

        .nav-link:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        .nav-link.active {
          background-color: #3b82f6;
          color: white;
        }

        .nav-icon {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
        }

        .nav-label {
          font-weight: 500;
          transition: opacity 0.3s ease;
        }

        .nav-label.hidden {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .user-info {
          display: flex;
          align-items: center;
          transition: opacity 0.3s ease;
        }

        .user-info.hidden {
          opacity: 0;
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          font-size: 1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .user-status {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;