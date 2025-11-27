import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './layout.css';
import { useSupabase } from '../auth/SupabaseProvider';

/**
 * Layout provides the persistent sidebar, top header, and wraps page content
 * with animated route transitions and accessibility features.
 */
export default function Layout({ children }) {
  const { session, profile, signOut } = useSupabase();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const isAdmin = !!profile?.is_admin;

  const navItems = useMemo(() => {
    const items = [
      { to: '/', label: 'Dashboard', icon: '📊', end: true },
      { to: '/roles', label: 'Roles', icon: '🧭' },
      { to: '/competencies', label: 'Competencies', icon: '🧩' },
      { to: '/plans', label: 'Plans & Goals', icon: '🎯' },
      { to: '/users', label: 'Users', icon: '👥' },
    ];
    if (isAdmin) items.push({ to: '/admin', label: 'Admin', icon: '🛠️' });
    return items;
  }, [isAdmin]);

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <aside className="sidebar" aria-label="Primary">
        <button
          className="sidebar-toggle"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen((s) => !s)}
        >
          {sidebarOpen ? '«' : '»'}
        </button>

        <div className="brand" role="heading" aria-level={1} tabIndex={0}>
          <span className="brand-icon">🌊</span>
          {sidebarOpen && <span>Career Planner</span>}
        </div>

        <div className="nav-section">{sidebarOpen ? 'Main' : '•'}</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
              aria-label={item.label}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {sidebarOpen && <span className="nav-text">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="nav-section">{sidebarOpen ? 'Account' : '•'}</div>
        <div className="nav">
          <button
            className="linklike"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle theme"
          >
            <span className="nav-icon" aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            {sidebarOpen && <span className="nav-text">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
          {session ? (
            <button className="linklike" onClick={handleSignOut} aria-label="Sign out">
              <span className="nav-icon" aria-hidden="true">🚪</span>
              {sidebarOpen && <span className="nav-text">Sign out</span>}
            </button>
          ) : (
            <NavLink to="/login" className={navLinkClass} aria-label="Login">
              <span className="nav-icon" aria-hidden="true">🔐</span>
              {sidebarOpen && <span className="nav-text">Login</span>}
            </NavLink>
          )}
        </div>
      </aside>

      <header className="header" role="banner">
        <div className="header-left">
          <div className="app-title">Career Planner</div>
        </div>
        <div className="header-center">
          <input
            className="search"
            aria-label="Search"
            role="searchbox"
            placeholder="Search (coming soon)"
            onFocus={(e) => e.currentTarget.select?.()}
          />
        </div>
        <div className="header-right" aria-live="polite">
          <div className="badge" title={profile?.email || ''}>{profile?.email || 'Guest'}</div>
          <div className="role-chip" aria-label="Role">{isAdmin ? 'Admin' : 'User'}</div>
        </div>
      </header>

      <main className="content" role="main">
        <RouteTransition locationKey={location.key}>
          {children}
        </RouteTransition>
      </main>
    </div>
  );
}

/**
 * RouteTransition applies smooth fade/slide animations on page change using CSS transitions only.
 */
function RouteTransition({ children, locationKey }) {
  return (
    <div className="route-anim-wrapper" key={locationKey} aria-live="polite">
      <div className="route-anim">{children}</div>
    </div>
  );
}
