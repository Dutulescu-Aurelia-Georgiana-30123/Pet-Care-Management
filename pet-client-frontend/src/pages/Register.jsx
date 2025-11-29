// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Auth from '../services/auth.js';
import '../App.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

    async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      await Auth.register({ name, email, phone, password });
      navigate('/login');
    } catch (e) {
      console.error('Register error:', e);

      let message = 'Registration failed.';

      if (e.response?.data) {
        const data = e.response.data;

        if (typeof data === 'string') {
          // backend trimite un string simplu
          message = data;
        } else if (data.error) {
          // backend trimite { error: "..." }
          message = data.error;
        } else {
          // backend trimite un obiect cu mesaje pe câmpuri
          message = Object.values(data).join(', ');
        }
      } else if (e.message) {
        // de ex. "Network Error"
        message = e.message;
      }

      setErr(message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🐾 Pet Care Client</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Join Pet Care to keep your pets and appointments in one place.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Name</label>
            <input
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="auth-label">Phone</label>
            <input
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07xxxxxxxx"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              autoComplete="new-password"
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
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
