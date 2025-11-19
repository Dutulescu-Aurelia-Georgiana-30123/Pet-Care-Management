import { useEffect, useState, useRef } from 'react';
import OwnersService from '../services/owners';
import { toast } from '../components/Toast.jsx';

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  // 👇 ref-uri pentru scroll + focus
  const formRef = useRef(null);
  const firstFieldRef = useRef(null);

  useEffect(() => { loadOwners(); }, []);

  async function loadOwners() {
    setLoading(true);
    try {
      const data = await OwnersService.list();
      setOwners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca owners. Verifică backend-ul.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: '', phone: '', email: '' });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(owner) {
    setForm({
      name: owner.name || '',
      phone: owner.phone || '',
      email: owner.email || '',
    });
    setEditingId(owner.id);
    setShowForm(true);

    // 👇 după ce apare formularul, facem scroll sus și focus pe Name
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 250);
    });
  }

  function validate() {
    if (!form.name.trim()) return 'Numele este obligatoriu.';
    const telOk = /^(\+4)?07\d{8}$/.test(form.phone.trim());
    if (!telOk) return 'Telefon invalid. Format: 07xxxxxxxx (opțional +4 în față).';
    const emailOk = /^\S+@\S+\.\S+$/.test(form.email.trim());
    if (!emailOk) return 'Email invalid.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { toast(v, 'error'); return; }

    setLoading(true);
    try {
      if (editingId) {
        await OwnersService.update(editingId, form);
        toast('Owner updated successfully!', 'success');
      } else {
        await OwnersService.create(form);
        toast('Owner created successfully!', 'success');
      }
      resetForm();
      await loadOwners();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        (typeof e?.response?.data === 'string' ? e.response.data : null) ||
        (e?.response?.data && Object.values(e.response.data).join(', ')) ||
        'Eroare la salvare. Verifică datele.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you deleting this owner?')) return;
    setLoading(true);
    try {
      await OwnersService.remove(id);
      toast('Owner successfully deleted!', 'success');
      await loadOwners();
    } catch (e) {
      console.error(e);
      toast('Could not delete the owner.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="owners-page">
      <div className="page-header">
        <h2>👤 Owners</h2>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={loading}
        >
          + Add Owner
        </button>
      </div>

      {showForm && (
        <div className="card form-card" ref={formRef}>
          <h3>{editingId ? 'Edit Owner' : 'Add new Owner'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                ref={firstFieldRef}
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name "
                minLength={2}
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label>Telefon *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="07xxxxxxxx"
                pattern="(\+4)?07\d{8}"
              />
              <small>Format: 07xxxxxxxx</small>
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Save...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && <div className="loading">Se încarcă...</div>}

      {!loading && owners.length === 0 && !showForm && (
        <div className="empty-state">
          <p>Nu există owners încă. Adaugă primul owner!</p>
        </div>
      )}

      {!loading && owners.length > 0 && (
        <div className="owners-grid">
          {owners.map((owner) => (
            <div key={owner.id} className="card owner-card">
              <div className="owner-info">
                <h3>{owner.name}</h3>
                <p className="owner-email">📧 {owner.email}</p>
                <p className="owner-phone">📱 {owner.phone}</p>
                {owner.petNames?.length > 0 && (
                  <div className="owner-pets">
                    <strong>Pets:</strong> {owner.petNames.join(', ')}
                  </div>
                )}
              </div>
              <div className="owner-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => startEdit(owner)}
                  disabled={loading}
                >
                  Edit owner
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(owner.id)}
                  disabled={loading}
                >
                  Delete owner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
