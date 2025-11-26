import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../services/auth';

export default function Login({ onLogin, owner }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await Auth.login(form);   // { email, password }
      onLogin(data);                         // salvăm owner-ul în App
      navigate('/dashboard');
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
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1>Login</h1>

      {owner && (
        <p>Already logged in as <strong>{owner.name}</strong></p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br />
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br />
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {err && (
          <div style={{ color: 'red', marginBottom: 12 }}>{err}</div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Don&apos;t have an account?{' '}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
