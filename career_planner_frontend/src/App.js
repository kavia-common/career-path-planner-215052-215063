import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './components/layout.css';
import { SupabaseProvider } from './auth/SupabaseProvider';
import { AuthGate } from './auth/AuthGate';
import DashboardPage from './pages/DashboardPage';
import RolesPage from './pages/RolesPage';
import RoleDetailPage from './pages/RoleDetailPage';
import CompetenciesPage from './pages/CompetenciesPage';
import PlansGoalsPage from './pages/PlansGoalsPage';
import AdminPage from './pages/admin/AdminPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import Layout from './components/Layout';

/**
 * Simple email/password login form (kept minimal, styled via shared tokens).
 */
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Use SupabaseProvider hook locally to keep behavior unchanged
  const { signInWithPassword, signUpWithPassword } = require('./auth/SupabaseProvider');

  const { useSupabase } = require('./auth/SupabaseProvider');
  const supa = useSupabase?.();
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'signin') {
        const { error } = await supa.signInWithPassword(email, password);
        if (error) throw error;
        setMessage('Signed in successfully.');
      } else {
        const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
        const { error } = await supa.signUpWithPassword(email, password, siteUrl);
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
    <div className="card auth-card" role="form" aria-label="Login form">
      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-16">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-16">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
          <button className="btn ghost" type="button" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create Account' : 'Have an account? Sign In'}
          </button>
        </div>
        {message && <div className="mt-16 text-muted" role="status">{message}</div>}
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
        <Layout>
          <Routes>
            <Route path="/" element={<AuthGate><DashboardPage /></AuthGate>} />
            <Route path="/roles" element={<AuthGate><RolesPage /></AuthGate>} />
            <Route path="/roles/:roleId" element={<AuthGate><RoleDetailPage /></AuthGate>} />
            <Route path="/competencies" element={<AuthGate><CompetenciesPage /></AuthGate>} />
            <Route path="/plans" element={<AuthGate><PlansGoalsPage /></AuthGate>} />
            <Route path="/users" element={<AuthGate><UsersPage /></AuthGate>} />
            <Route path="/users/:userId" element={<AuthGate><UserDetailPage /></AuthGate>} />
            <Route path="/admin" element={<AuthGate adminOnly><AdminPage /></AuthGate>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SupabaseProvider>
  );
}

export default App;
