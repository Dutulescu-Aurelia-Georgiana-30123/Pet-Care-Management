// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../services/auth.js';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await Auth.login(form); // { id, name, email, phone... }
      if (onLogin) onLogin(data);
      navigate('/home');
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data ||
        'Login failed. Check email and password.';
      setErr(typeof msg === 'string' ? msg : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', color: 'white' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: 8, borderRadius: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: 8, borderRadius: 8 }}
            required
          />
        </div>
        {err && <div style={{ color: 'salmon', marginBottom: 8 }}>{err}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
