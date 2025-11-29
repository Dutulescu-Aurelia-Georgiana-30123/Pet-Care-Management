// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import Pets from '../services/pets.js';
import Appointments from '../services/appointments.js';

export default function Home({ owner }) {
  const [stats, setStats] = useState({
    pets: 0,
    appointments: 0,
    loading: true,
  });

  useEffect(() => {
    if (!owner?.id) return;

    async function load() {
      try {
        const [pets, apps] = await Promise.all([
          Pets.byOwner(owner.id).catch(() => []),
          Appointments.byOwner(owner.id).catch(() => []),
        ]);

        setStats({
          pets: Array.isArray(pets) ? pets.length : 0,
          appointments: Array.isArray(apps) ? apps.length : 0,
          loading: false,
        });
      } catch {
        setStats((s) => ({ ...s, loading: false }));
      }
    }

    load();
  }, [owner]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',      // sub header
        display: 'flex',
        justifyContent: 'center',             // cardul pe mijloc pe orizontală
        alignItems: 'flex-start',             // ⬅️ NU mai îl centram vertical
        padding: '40px 16px 100px',           // mai mult padding jos pt. poze
        background:
          'radial-gradient(circle at top left, #fee2ff 0, #e0e7ff 38%, #fdf2ff 100%)',
      }}
    >
      {/* card central, totul centrat în el */}
      <div
        style={{
          width: 'min(900px, 100%)',
          borderRadius: 32,
          padding: '32px 40px 36px',
          background: '#ffffff',
          boxShadow: '0 26px 70px rgba(180, 83, 166, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
          marginTop: 40,                      // mic spațiu sub header
        }}
      >
        {/* badge + text de întâmpinare */}
        <div className="auth-badge">
          <span>🐾</span>
          <span>Pet Care Client</span>
        </div>

        <div>
          <h2
            style={{
              fontSize: 28,
              margin: '8px 0 4px',
              color: '#111827',
            }}
          >
            Welcome, {owner?.name || 'client'}! 🐾
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: 14,
            }}
          >
            Here you can manage your pets and veterinary appointments.
          </p>
        </div>

        {stats.loading ? (
          <div style={{ color: '#6b7280' }}>Loading your data…</div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              justifyContent: 'center',  // cardurile mici pe mijloc
            }}
          >
            <StatCard label="Pets" value={stats.pets} />
            <StatCard label="Appointments" value={stats.appointments} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="client-stat-card">
      <div className="client-stat-value">{value}</div>
      <div className="client-stat-label">{label}</div>
    </div>
  );
}
