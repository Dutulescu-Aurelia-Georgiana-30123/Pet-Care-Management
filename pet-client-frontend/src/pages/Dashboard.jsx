import { useEffect, useState } from 'react';
import PetsService from '../services/pets';
import AppointmentsService from '../services/appointments';

export default function Dashboard({ owner }) {
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!owner?.id) return;

    async function loadAll() {
      setLoading(true);
      setErr('');
      try {
        const [petsData, apptData] = await Promise.all([
          PetsService.byOwner(owner.id),
          AppointmentsService.byOwner(owner.id),
        ]);
        setPets(Array.isArray(petsData) ? petsData : []);
        setAppointments(Array.isArray(apptData) ? apptData : []);
      } catch (e) {
        console.error(e);
        const msg =
          e?.response?.data ||
          'Could not load your pets / appointments.';
        setErr(typeof msg === 'string' ? msg : 'Error loading data.');
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [owner?.id]);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16, color: 'white' }}>
      <h1>Welcome, {owner.name}!</h1>
      <p>Email: {owner.email}</p>
      <p>Phone: {owner.phone}</p>

      {err && (
        <div style={{ marginTop: 16, color: 'salmon' }}>{err}</div>
      )}

      {loading ? (
        <p style={{ marginTop: 24 }}>Loading your data…</p>
      ) : (
        <>
          {/* My Pets */}
          <section style={{ marginTop: 32 }}>
            <h2>My Pets</h2>
            {pets.length === 0 ? (
              <p>You don&apos;t have any pets registered yet.</p>
            ) : (
              <ul>
                {pets.map(p => (
                  <li key={p.id}>
                    <strong>{p.name}</strong>
                    {p.species && <> — {p.species}</>}
                    {p.breed && <> ({p.breed})</>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* My Appointments */}
          <section style={{ marginTop: 32 }}>
            <h2>My Appointments</h2>
            {appointments.length === 0 ? (
              <p>You don&apos;t have any appointments yet.</p>
            ) : (
              <ul>
                {appointments.map(a => (
                  <li key={a.id}>
                    <strong>
                      {new Date(a.dateTime).toLocaleString()}
                    </strong>
                    {a.description && <> — {a.description}</>}
                    {a.petName && <> (pet: {a.petName})</>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
