
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Auth from '../services/auth.js';
import '../App.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();               // ca să nu trimită form clasic

  setError('');
  try {
    const data = await Auth.login(email, password);
    onLogin(data);                  // ce aveai tu înainte
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data ||
      'Login failed.';
    setError(String(msg));
  }
}

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            🐾 Pet Care Client
          </div>
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Sign in to manage your pets and appointments.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#b91c1c',
                background: '#fee2e2',
                borderRadius: 10,
                padding: '8px 10px',
              }}
            >
              {err}
            </div>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
