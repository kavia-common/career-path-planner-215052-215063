import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { SupabaseProvider, useSupabase } from './auth/SupabaseProvider';
import { AuthGate } from './auth/AuthGate';
import DashboardPage from './pages/DashboardPage';
import RolesPage from './pages/RolesPage';
import RoleDetailPage from './pages/RoleDetailPage';
import CompetenciesPage from './pages/CompetenciesPage';
import PlansGoalsPage from './pages/PlansGoalsPage';
import AdminPage from './pages/admin/AdminPage';

/**
 * AppShell renders the layout, navigation, and routes.
 */
function AppShell() {
  const [theme, setTheme] = useState('light');
  const { session, profile, signOut } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const isAdmin = !!profile?.is_admin;

  const navLinkClass = ({ isActive }) => (isActive ? 'active' : '');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Career Planner</div>

        <div className="nav-section">Main</div>
        <nav className="nav">
          <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/roles" className={navLinkClass}>Roles</NavLink>
          <NavLink to="/competencies" className={navLinkClass}>Competencies</NavLink>
          <NavLink to="/plans" className={navLinkClass}>Plans & Goals</NavLink>
          {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <div className="nav-section">Account</div>
        <div className="nav">
          <button className="linklike" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          {session ? (
            <button className="linklike" onClick={handleSignOut}>Sign out</button>
          ) : (
            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
          )}
        </div>
      </aside>

      <header className="header">
        <div />
        <div className="row">
          <div className="text-muted">{profile?.email}</div>
          <div className="text-muted">{isAdmin ? 'Admin' : 'User'}</div>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<AuthGate><DashboardPage /></AuthGate>} />
          <Route path="/roles" element={<AuthGate><RolesPage /></AuthGate>} />
          <Route path="/roles/:roleId" element={<AuthGate><RoleDetailPage /></AuthGate>} />
          <Route path="/competencies" element={<AuthGate><CompetenciesPage /></AuthGate>} />
          <Route path="/plans" element={<AuthGate><PlansGoalsPage /></AuthGate>} />
          <Route path="/admin" element={<AuthGate adminOnly><AdminPage /></AuthGate>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Simple email/password login form.
 */
function LoginPage() {
  const { signInWithPassword, signUpWithPassword } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        setMessage('Signed in successfully.');
      } else {
        const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
        const { error } = await signUpWithPassword(email, password, siteUrl);
        if (error) throw error;
        setMessage('Check your email to confirm your account.');
      }
    } catch (err) {
      setMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-16">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-16">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
          <button className="btn ghost" type="button" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create Account' : 'Have an account? Sign In'}
          </button>
        </div>
        {message && <div className="mt-16 text-muted">{message}</div>}
      </form>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root providers and router. */
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  return (
    <SupabaseProvider url={supabaseUrl} anonKey={anonKey}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </SupabaseProvider>
  );
}

export default App;
