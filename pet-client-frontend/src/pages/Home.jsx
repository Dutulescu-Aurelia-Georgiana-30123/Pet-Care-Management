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
    <div>
      <h2 style={{ fontSize: 26, marginBottom: 8 }}>
        Welcome, {owner?.name || 'client'}! 🐾
      </h2>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        Here you can manage your pets and veterinary appointments.
      </p>

      {stats.loading ? (
        <div>Loading your data…</div>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard label="Pets" value={stats.pets} />
          <StatCard label="Appointments" value={stats.appointments} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        minWidth: 180,
        padding: 16,
        borderRadius: 16,
        background: '#1f2937',
        boxShadow: '0 10px 25px rgba(0,0,0,.35)',
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#9ca3af' }}>{label}</div>
    </div>
  );
}
