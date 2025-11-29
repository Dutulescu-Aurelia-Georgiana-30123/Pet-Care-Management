// src/pages/ClientPets.jsx
import { useEffect, useState } from 'react';
import Pets from '../services/pets.js';

export default function ClientPets({ owner, showToast}) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', species: '', breed: '' });
  const [error, setError] = useState('');

  // încarcă pets pentru owner-ul logat
  async function loadPets() {
    if (!owner?.id) return;
    setLoading(true);
    try {
      const data = await Pets.byOwner(owner.id);
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadPets error', err);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner?.id]);

  function resetForm() {
    setForm({ name: '', species: '', breed: '' });
    setEditingId(null);
    setError('');
  }

  function startAdd() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(p) {
    setForm({
      name: p.name || '',
      species: p.species || '',
      breed: p.breed || '',
    });
    setEditingId(p.id);
    setShowForm(true);
    setError('');
  }

  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.species.trim()) return 'Species is required.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!owner?.id) {
      setError('Internal error: no logged in owner.');
      return;
    }

    const validationMsg = validate();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    const payload = {
      name: form.name.trim(),
      species: form.species.trim() || undefined,
      breed: form.breed.trim() || undefined,
      // trimitem și owner-ul la fel ca în admin-frontend
      owner: { id: owner.id },
    };

    setLoading(true);
    try {
  const payload = {
    name: form.name.trim(),
    species: form.species.trim() || undefined,
    breed: form.breed.trim() || undefined,
    owner: { id: owner.id },
  };

  if (editingId) {
    await Pets.update(editingId, payload);
    showToast && showToast('Pet updated successfully.');
  } else {
    await Pets.create(payload);
    showToast && showToast('Pet created successfully.');
  }

  await loadPets();
  resetForm();
  setShowForm(false);
} catch (err) {
  console.error('save pet error', err?.response?.data || err);
  setError('Could not save pet. Please try again.');
  showToast && showToast('Could not save pet.', 'error');
} finally {
  setLoading(false);
}
  }

  async function handleDelete(id) {
  if (!window.confirm('Delete this pet?')) return;
  setLoading(true);
  try {
    await Pets.remove(id);
    await loadPets();
    showToast && showToast('Pet deleted successfully.');
  } catch {
    alert('Could not delete pet.');
    showToast && showToast('Could not delete pet.', 'error');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="client-page">
      <div className="client-page-inner">
        {/* titlu + buton Add */}
        <div className="client-page-header-row">
          <h2 className="client-page-title">
            My Pets <span>🐶</span>
          </h2>
          <button
            type="button"
            className="client-page-add-btn"
            onClick={startAdd}
          >
            + Add pet
          </button>
        </div>

        {/* card cu formular Add/Edit */}
        {showForm && (
          <div className="client-card">
            <h3 className="client-card-title">
              {editingId ? 'Edit pet' : 'Add pet'}
            </h3>

            {error && <div className="client-error-banner">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Name *</label>
                <input
                  className="auth-input"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="client-form-row">
                <div className="auth-field client-form-field">
                  <label className="auth-label">Species *</label>
                  <input
                    className="auth-input"
                    type="text"
                    value={form.species}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, species: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="auth-field client-form-field">
                  <label className="auth-label">Breed</label>
                  <input
                    className="auth-input"
                    type="text"
                    value={form.breed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, breed: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {editingId ? 'Save changes' : 'Create'}
                </button>
                {editingId || showForm ? (
                  <button
                    type="button"
                    className="client-btn-secondary"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        )}

        {/* listă de pets */}
        {loading && !pets.length ? (
          <div className="client-card">Loading…</div>
        ) : pets.length === 0 ? (
          <div className="client-card client-empty">
            You don&apos;t have any pets yet. Click <b>“Add pet”</b> to create
            one!
          </div>
        ) : (
          pets.map((p) => (
            <div key={p.id} className="client-card client-pet-card">
              <div className="client-pet-main">
                <div className="client-pet-name">
                  {p.name || 'Unnamed pet'}
                </div>
                <div className="client-pet-meta">
                  {p.species || 'Unknown species'}
                  {p.breed ? ` · ${p.breed}` : ''}
                </div>
              </div>

              <div className="client-pet-actions">
                <button
                  type="button"
                  className="client-btn-secondary"
                  onClick={() => startEdit(p)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="client-btn-danger"
                  onClick={() => handleDelete(p.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
