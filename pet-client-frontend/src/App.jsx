import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import ClientPets from './pages/ClientPets.jsx';
import ClientAppointments from './pages/ClientAppointments.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [owner, setOwner] = useState(null);
  const [toast, setToast] = useState(null);

  // citim owner-ul din localStorage (ca să rămână logat după refresh)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pc_owner');
      if (raw) {
        setOwner(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  function handleLogin(data) {
    setOwner(data);
    try {
      localStorage.setItem('pc_owner', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  function handleLogout() {
    setOwner(null);
    try {
      localStorage.removeItem('pc_owner');
    } catch {
      // ignore
    }
  }

  // funcție pentru notificări
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  return (
    <BrowserRouter>
      {/* toast global, vizibil peste toate paginile */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {owner ? (
        <div
          style={{
            minHeight: '100vh',
            background:
              'radial-gradient(circle at top, #fde7ff 0, #e5edff 45%, #fdf2ff 100%)',
            color: '#111827',
          }}
        >
          <header
            style={{
              padding: '14px 32px',
              borderBottom: '1px solid rgba(244, 114, 182, 0.35)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 22, color: '#111827' }}>
                🐾 Pet Care Client
              </h1>
              <small style={{ color: '#6b7280' }}>
                Logged in as {owner.name}
              </small>
            </div>
            <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Link style={{ color: '#4b5563', fontWeight: 500 }} to="/home">
                Home
              </Link>
              <Link style={{ color: '#4b5563', fontWeight: 500 }} to="/pets">
                My Pets
              </Link>
              <Link
                style={{ color: '#4b5563', fontWeight: 500 }}
                to="/appointments"
              >
                My Appointments
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  marginLeft: 16,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(90deg, #fb7185, #f973ff)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Logout
              </button>
            </nav>
          </header>

          <main style={{ padding: '32px 24px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home owner={owner} />} />
              <Route
                path="/pets"
                element={<ClientPets owner={owner} showToast={showToast} />}
              />
              <Route
                path="/appointments"
                element={
                  <ClientAppointments owner={owner} showToast={showToast} />
                }
              />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </main>
        </div>
      ) : (
        // layout când NU e logat
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
