// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import ClientPets from './pages/ClientPets.jsx';
import ClientAppointments from './pages/ClientAppointments.jsx';

export default function App() {
  const [owner, setOwner] = useState(null);

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

  return (
    <BrowserRouter>
      {owner ? (
        // layout când e logat
        <div style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
          <header
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid #374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>🐾 Pet Care Client</h1>
              <small>Logged in as {owner.name}</small>
            </div>
            <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Link style={{ color: 'white' }} to="/home">
                Home
              </Link>
              <Link style={{ color: 'white' }} to="/pets">
                My Pets
              </Link>
              <Link style={{ color: 'white' }} to="/appointments">
                My Appointments
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  marginLeft: 16,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #f97373',
                  background: 'transparent',
                  color: '#fecaca',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </nav>
          </header>

          <main
  style={{
    padding: 24,
    minHeight: 'calc(100vh - 80px)', // ca să umple ecranul sub header
  }}
>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home owner={owner} />} />
              <Route path="/pets" element={<ClientPets owner={owner} />} />
              <Route path="/appointments" element={<ClientAppointments owner={owner} />} />
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
