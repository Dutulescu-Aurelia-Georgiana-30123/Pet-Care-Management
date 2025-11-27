// src/pages/ClientAppointments.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import Appointments from '../services/appointments.js';
import Pets from '../services/pets.js';

export default function ClientAppointments({ owner }) {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    date: '',
    time: '',
    description: '',
    petId: '',
  });
  const [editingId, setEditingId] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (!owner?.id) return;
    loadAll();
  }, [owner]);

  async function loadAll() {
    setLoading(true);
    setErr('');
    try {
      const [apps, petsData] = await Promise.all([
        Appointments.byOwner(owner.id).catch(() => []),
        Pets.byOwner(owner.id).catch(() => []),
      ]);
      setAppointments(Array.isArray(apps) ? apps : []);
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (e) {
      console.error(e);
      setErr('Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ date: '', time: '', description: '', petId: '' });
    setEditingId(null);
  }

  function startEdit(a) {
    const d = new Date(a.dateTime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    setForm({
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${mi}`,
      description: a.description || '',
      petId: a.petId ? String(a.petId) : '',
    });
    setEditingId(a.id);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.time || !form.petId || !form.description.trim()) {
      setErr('Please fill all fields.');
      return;
    }

    setLoading(true);
    setErr('');
    try {
      if (editingId) {
        await Appointments.update(editingId, owner.id, Number(form.petId), form);
      } else {
        await Appointments.createForOwner(owner.id, Number(form.petId), form);
      }
      resetForm();
      await loadAll();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data ||
        'Saving appointment failed.';
      setErr(typeof msg === 'string' ? msg : 'Saving appointment failed.');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setLoading(true);
    setErr('');
    try {
      await Appointments.remove(id);
      await loadAll();
    } catch (e) {
      console.error(e);
      setErr('Could not cancel appointment.');
    } finally {
      setLoading(false);
    }
  }

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
      ),
    [appointments],
  );

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <h2>My Appointments 📅</h2>
        <button
          onClick={() => {
            resetForm();
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: 'none',
            background: '#22c55e',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          + New appointment
        </button>
      </div>

      {/* formular */}
      <div
        ref={formRef}
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          background: '#1f2937',
        }}
      >
        <h3>{editingId ? 'Edit appointment' : 'New appointment'}</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label>Date</label>
              <br />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8 }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label>Time</label>
              <br />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8 }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label>Pet</label>
              <br />
              <select
                value={form.petId}
                onChange={(e) => setForm({ ...form, petId: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8 }}
                required
              >
                <option value="">— choose pet —</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Description</label>
            <br />
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{ width: '100%', padding: 8, borderRadius: 8 }}
              placeholder="Consultation / vaccine / grooming…"
              required
            />
          </div>

          {err && (
            <div style={{ color: 'salmon', marginBottom: 8 }}>{err}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {editingId ? 'Save changes' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* listă */}
      {loading && sorted.length === 0 ? (
        <div>Loading…</div>
      ) : sorted.length === 0 ? (
        <div>You don&apos;t have any appointments yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((a) => (
            <div
              key={a.id}
              style={{
                padding: 16,
                borderRadius: 16,
                background: '#111827',
                border: '1px solid #374151',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {new Date(a.dateTime).toLocaleString()}
                </div>
                <div style={{ color: '#9ca3af', marginTop: 4 }}>
                  {a.description}
                </div>
                <div style={{ color: '#9ca3af', marginTop: 4 }}>
                  Pet: {a.petName || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => startEdit(a)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#4b5563',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
