// src/pages/ClientPets.jsx
import { useEffect, useState, useRef } from 'react';
import Pets from '../services/pets.js';

export default function ClientPets({ owner }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
  });
  const [editingId, setEditingId] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (!owner?.id) return;
    loadPets();
  }, [owner]);

  async function loadPets() {
    setLoading(true);
    setErr('');
    try {
      const data = await Pets.byOwner(owner.id);
      setPets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr('Could not load your pets.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: '', species: '', breed: '' });
    setEditingId(null);
  }

  function startEdit(p) {
    setForm({
      name: p.name || '',
      species: p.species || '',
      breed: p.breed || '',
    });
    setEditingId(p.id);

    // scroll la formular
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErr('Name is required.');
      return;
    }

    setLoading(true);
    setErr('');
    try {
      if (editingId) {
        await Pets.update(editingId, owner.id, form);
      } else {
        await Pets.createForOwner(owner.id, form);
      }
      resetForm();
      await loadPets();
    } catch (e) {
      console.error(e);
      setErr('Saving pet failed.');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this pet?')) return;
    setLoading(true);
    setErr('');
    try {
      await Pets.remove(id);
      await loadPets();
    } catch (e) {
      console.error(e);
      setErr('Could not delete pet (maybe it has appointments).');
    } finally {
      setLoading(false);
    }
  }

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
        <h2>My Pets 🐶</h2>
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
            background: '#f472b6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          + Add pet
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
        <h3>{editingId ? 'Edit pet' : 'Add pet'}</h3>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name *</label>
            <br />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 8 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label>Species</label>
              <br />
              <input
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label>Breed</label>
              <br />
              <input
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8 }}
              />
            </div>
          </div>

          {err && (
            <div style={{ color: 'salmon', marginTop: 8, marginBottom: 8 }}>{err}</div>
          )}

          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
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
      {loading && pets.length === 0 ? (
        <div>Loading…</div>
      ) : pets.length === 0 ? (
        <div>You don&apos;t have any pets yet.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {pets.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 16,
                borderRadius: 16,
                background: '#111827',
                border: '1px solid #374151',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{p.name}</h3>
              <div style={{ color: '#9ca3af', marginBottom: 8 }}>
                {p.species || 'Unknown species'}
                {p.breed ? ` · ${p.breed}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => startEdit(p)}
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
                  onClick={() => onDelete(p.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
