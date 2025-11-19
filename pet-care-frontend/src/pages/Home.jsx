import { useEffect, useState } from 'react';
import OwnersService from '../services/owners';
import PetsService from '../services/pets';
import AppointmentsService from '../services/appointments';
import { toast } from '../components/Toast';

export default function Home() {
  const [stats, setStats] = useState({
    owners: 0,
    pets: 0,
    appointments: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [ownersData, petsData, appointmentsData] = await Promise.all([
        OwnersService.list().catch(() => []),
        PetsService.list().catch(() => []),
        AppointmentsService.list().catch(() => [])
      ]);

      setStats({
        owners: Array.isArray(ownersData) ? ownersData.length : 0,
        pets: Array.isArray(petsData) ? petsData.length : 0,
        appointments: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
        loading: false
      });
    } catch (e) {
      console.error('Error loading stats:', e);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>🐾 Welcome to Pet Care Management!</h1>
        <p className="welcome-text">
          Veterinary practice management system. Manage owners, pets, and appointments in one place.
        </p>
      </div>

      {stats.loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>{stats.owners}</h3>
              <p>Owners</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🐶</div>
            <div className="stat-content">
              <h3>{stats.pets}</h3>
              <p>Pets</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.appointments}</h3>
              <p>Appointments</p>
            </div>
          </div>
        </div>
      )}

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>👤 Owners</h3>
            <p>Manage information about animal owners. Add, edit or delete owners.</p>
          </div>
          <div className="feature-card">
            <h3>🐶 Pets</h3>
            <p>Manage pets. Filter by owner or species.</p>
          </div>
          <div className="feature-card">
            <h3>📅 Appointments</h3>
            <p>Schedule and manage appointments with clients and their animals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}