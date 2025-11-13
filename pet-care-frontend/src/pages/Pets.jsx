import { useEffect, useMemo, useState } from 'react';
import PetsApi from '../services/pets.js';
import OwnersApi from '../services/owners.js';
import { toast } from '../components/Toast.jsx'; // doar funcția, fără ToastContainer aici

export default function PetsPage() {
  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // owners pentru dropdown
  const [owners, setOwners] = useState([]);

  // filtre
  const [filters, setFilters] = useState({ ownerId: '', species: '', q: '' });

  // form add/edit
  const [form, setForm] = useState({ name: '', species: '', breed: '', ownerId: '' });
  const [editingId, setEditingId] = useState(null);

  // map pt. afișare nume owner după id
  const ownersMap = useMemo(() => {
    const m = new Map();
    owners.forEach(o => m.set(String(o.id), o.name));
    return m;
  }, [owners]);

  // helpers
  const normalize = (v) => (v === '' ? undefined : v);

  function validate(p) {
    if (!p.name?.trim()) return 'Numele este obligatoriu.';
    if (!p.ownerId) return 'Owner-ul este obligatoriu.';
    return '';
  }

  // loads
  async function loadOwners() {
    try {
      const data = await OwnersApi.list();
      setOwners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca lista de owners', 'error');
    }
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const params = {
        ownerId: normalize(filters.ownerId),
        species: normalize(filters.species),
        q: normalize(filters.q),
      };
      const data = await PetsApi.list(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca pets', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOwners(); fetchAll(); }, []);
  useEffect(() => { fetchAll(); }, [filters.ownerId, filters.species, filters.q]);

  // actions
  async function submitPet(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      species: normalize(form.species),
      breed: normalize(form.breed),
      owner: { id: Number(form.ownerId) },
    };
    const err = validate({ ...payload, ownerId: form.ownerId });
    if (err) { toast(err, 'error'); return; }

    setLoading(true);
    try {
      if (editingId) {
        await PetsApi.update(editingId, payload);
        toast('Pet actualizat', 'success');
      } else {
        await PetsApi.create(payload);
        toast('Pet creat', 'success');
      }
      setForm({ name: '', species: '', breed: '', ownerId: '' });
      setEditingId(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
      toast('Operațiunea a eșuat', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm('Ștergi acest pet?')) return;
    setLoading(true);
    try {
      await PetsApi.remove(id);
      toast('Pet șters', 'success');
      await fetchAll();
    } catch (e) {
      console.error(e);
      toast('Ștergerea a eșuat', 'error');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p) {
    setForm({
      name: p.name || '',
      species: p.species || '',
      breed: p.breed || '',
      ownerId: p.ownerId ? String(p.ownerId) : '',
    });
    setEditingId(p.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', species: '', breed: '', ownerId: '' });
  }

  // render
return (
  <section>
    <h2>🐶 Pets</h2>

    {/* Filtre */}
    <div className="card filters-card">
      <div className="filters-grid">
        <div className="form-group">
          <label>Owner</label>
          <select
            value={filters.ownerId}
            onChange={e=>setFilters({...filters, ownerId: e.target.value})}
          >
            <option value="">Toți owners</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Species</label>
          <input
            value={filters.species}
            onChange={e=>setFilters({...filters, species:e.target.value})}
            placeholder="dog, cat, etc."
          />
        </div>

        <div className="form-group">
          <label>Search</label>
          <input
            value={filters.q}
            onChange={e=>setFilters({...filters, q:e.target.value})}
            placeholder="name/breed"
          />
        </div>

        <div className="form-group">
          <button className="btn btn-primary" onClick={fetchAll}>Aplică filtre</button>
          <button className="btn btn-secondary" onClick={()=>{ setFilters({ ownerId:'', species:'', q:'' }); fetchAll(); }}>
            Șterge filtre
          </button>
        </div>
      </div>
    </div>

    {/* Form Add/Edit */}
    <div className="card form-card">
      <h3>{editingId ? 'Editează pet' : 'Adaugă pet'}</h3>
      <form onSubmit={submitPet}>
        <div className="form-group" style={{maxWidth:360}}>
          <label>Name</label>
          <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Species</label>
            <input value={form.species} onChange={e=>setForm({...form, species:e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input value={form.breed} onChange={e=>setForm({...form, breed:e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Owner</label>
            <select required value={form.ownerId} onChange={e=>setForm({...form, ownerId:e.target.value})}>
              <option value="">— alege owner —</option>
              {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save changes' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>

    {/* Listă */}
    {loading ? (
      <div className="loading">Loading…</div>
    ) : rows.length ? (
      <>
        <div className="card" style={{marginBottom:0}}>
          <span className="owner-phone">{rows.length} pet{rows.length === 1 ? '' : 's'} găsit(e)</span>
        </div>
        <div className="pets-grid">
          {rows.map(p => (
            <div key={p.id} className="card pet-card">
              <div className="pet-info">
                <h3>{p.name}</h3>
                <div className="pet-species">{p.species || '—'}</div>
                {p.breed && <div className="pet-breed">Breed: {p.breed}</div>}
                <div className="pet-owner">Owner: {p.ownerName || ownersMap.get(String(p.ownerId)) || '—'}</div>
              </div>
              <div className="pet-actions">
                <button className="btn btn-secondary" onClick={()=>startEdit(p)}>Editează</button>
                <button className="btn btn-danger" onClick={()=>onDelete(p.id)}>Șterge</button>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="empty-state"><p>Nu există rezultate pentru filtrele curente.</p></div>
    )}
  </section>
);
}
