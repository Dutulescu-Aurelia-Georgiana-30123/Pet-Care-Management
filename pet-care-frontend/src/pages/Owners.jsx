import { useEffect, useState } from 'react';
import OwnersService from '../services/owners';
import { toast } from '../components/Toast.jsx';

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

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
  }

  function validate() {
    if (!form.name.trim()) return 'Numele este obligatoriu.';
    // telefon 07xxxxxxxx (opțional +4)
    const telOk = /^(\+4)?07\d{8}$/.test(form.phone.trim());
    if (!telOk) return 'Telefon invalid. Format: 07xxxxxxxx (opțional +4 în față).';
    // validare email simplă
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
        toast('Owner actualizat cu succes!', 'success');
      } else {
        await OwnersService.create(form);
        toast('Owner creat cu succes!', 'success');
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
    if (!window.confirm('Ștergi acest owner?')) return;
    setLoading(true);
    try {
      await OwnersService.remove(id);
      toast('Owner șters cu succes!', 'success');
      await loadOwners();
    } catch (e) {
      console.error(e);
      toast('Nu am putut șterge owner-ul.', 'error');
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
          + Adaugă Owner
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Editează Owner' : 'Adaugă Owner Nou'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nume *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nume complet"
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
                {loading ? 'Salvare...' : (editingId ? 'Actualizează' : 'Creează')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
                Anulează
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
                  Editează
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(owner.id)}
                  disabled={loading}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
