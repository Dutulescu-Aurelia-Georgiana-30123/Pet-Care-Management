import { useEffect, useState } from 'react';
import Pets from '../services/pets.js';
import Appointments from '../services/appointments.js';
import AiAssistant from "../AiAssistant";

export default function Home({ owner }) {
  const [stats, setStats] = useState({
    pets: 0,
    appointments: 0,
    loading: true,
  });

  // imaginile din /public
  const galleryImages = [
    '/poza%201.jpg',
    '/poza%202.jpg',
    '/poza%203.jpg',
    '/poza%204.webp',
    '/poza%205.webp',
    '/poza%206.jpg',
    '/poza%207.webp',
    '/poza%208.jpg',
    '/poza%209.jpeg',
  ];

  const [currentImage, setCurrentImage] = useState(0);

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

  function handlePrevImage() {
    setCurrentImage((i) =>
      i === 0 ? galleryImages.length - 1 : i - 1
    );
  }

  function handleNextImage() {
    setCurrentImage((i) =>
      i === galleryImages.length - 1 ? 0 : i + 1
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, #fee2ff 0, #e0e7ff 38%, #fdf2ff 100%)',
      }}
    >
      {/* coloană centrală: cardul alb + AI + galeria sub ele */}
      <div
        style={{
          width: 'min(1000px, 100%)',
          margin: '0 auto',
          padding: '40px 16px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* CARDUL ALB: welcome + statistici */}
        <div
          className="client-home-card"
          style={{
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
          }}
        >
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
            <div style={{ color: '#6b7280', marginTop: 12 }}>
              Loading your data…
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 12,
              }}
            >
              <StatCard label="Pets" value={stats.pets} />
              <StatCard label="Appointments" value={stats.appointments} />
            </div>
          )}
        </div>

        {/* CARD AI ASSISTANT */}
        <div
          style={{
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
            borderRadius: 32,
            padding: '24px 24px 28px',
            background: '#ffffff',
            boxShadow: '0 24px 60px rgba(148, 163, 184, 0.40)',
            border: '1px solid rgba(129, 140, 248, 0.4)',
          }}
        >
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: 20,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Veterinary Assistant (AI)
          </h3>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            Write down your pet's symptoms and the Ai will provide you 
            with a possible explanation and general recommendations. 
            It doesn't replace a veterinary consultation!!
          </p>

          {/* componenta ta de AI */}
          <AiAssistant />
        </div>

        {/* GALERIA – SUB cardul AI */}
        <div
          style={{
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
            borderRadius: 32,
            padding: '26px 26px 30px',
            background: '#ffffff',
            boxShadow: '0 24px 60px rgba(148, 163, 184, 0.45)',
            border: '1px solid rgba(248, 187, 247, 0.9)',
          }}
        >
          <h3
            style={{
              margin: '0 0 18px',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Gallery with our friends
          </h3>

          <div
            style={{
              position: 'relative',
              borderRadius: 28,
              overflow: 'hidden',
              minHeight: 160,
              maxHeight: 620,
            }}
          >
            <img
              src={galleryImages[currentImage]}
              alt="Pet at the vet"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transform: 'scale(1.00)',
              }}
            />

            {/* buton stânga */}
            <button
              type="button"
              onClick={handlePrevImage}
              style={{
                position: 'absolute',
                top: '50%',
                left: 18,
                transform: 'translateY(-50%)',
                borderRadius: '999px',
                border: 'none',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.45)',
              }}
            >
              ‹
            </button>

            {/* buton dreapta */}
            <button
              type="button"
              onClick={handleNextImage}
              style={{
                position: 'absolute',
                top: '50%',
                right: 18,
                transform: 'translateY(-50%)',
                borderRadius: '999px',
                border: 'none',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.45)',
              }}
            >
              ›
            </button>
          </div>

          {/* bulinele de sub poză */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImage(idx)}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    idx === currentImage
                      ? 'linear-gradient(135deg, #ec4899, #a855f7)'
                      : '#e5e7eb',
                  boxShadow:
                    idx === currentImage
                      ? '0 0 0 2px rgba(236, 72, 153, 0.4)'
                      : 'none',
                }}
              />
            ))}
          </div>
        </div>
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
