import { useEffect, useMemo, useState, useRef } from 'react';
import PetsApi from '../services/pets.js';
import OwnersApi from '../services/owners.js';
import { toast } from '../components/Toast.jsx';

export default function PetsPage() {
  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // owners (doar pentru afișarea numelui + dropdown din form)
  const [owners, setOwners] = useState([]);

  // filtre: doar species + search
  const [filters, setFilters] = useState({
    species: '',
    q: ''
  });

  // form add/edit
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    ownerId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 👈 ca la Owners

  // ref-uri pentru scroll + focus
  const formRef = useRef(null);
  const firstFieldRef = useRef(null);

  // map pt. afișare nume owner după id
  const ownersMap = useMemo(() => {
    const m = new Map();
    owners.forEach(o => m.set(String(o.id), o.name));
    return m;
  }, [owners]);

  const normalize = (v) => (v === '' ? undefined : v);

  function validate(p) {
    if (!p.name?.trim()) return 'Numele este obligatoriu.';
    if (!p.ownerId) return 'Owner-ul este obligatoriu.';
    return '';
  }

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
      const data = await PetsApi.list(); // luăm toate pets
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca pets', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
    fetchAll();
  }, []);

  // filtrare + sortare alfabetică după nume pet
  const filteredRows = useMemo(() => {
    const speciesFilter = filters.species.trim().toLowerCase();
    const q = filters.q.trim().toLowerCase(); // nume pet / rasă / nume owner

    return [...rows]
      .filter(p => {
        if (!speciesFilter) return true;
        return p.species && p.species.toLowerCase().includes(speciesFilter);
      })
      .filter(p => {
        if (!q) return true;
        const name = (p.name || '').toLowerCase();
        const breed = (p.breed || '').toLowerCase();
        const ownerName = (
          p.ownerName ||
          ownersMap.get(String(p.ownerId)) ||
          ''
        ).toLowerCase();
        return (
          name.includes(q) ||
          breed.includes(q) ||
          ownerName.includes(q)
        );
      })
      .sort((a, b) => {
        const na = (a.name || '').toLowerCase();
        const nb = (b.name || '').toLowerCase();
        return na.localeCompare(nb);
      });
  }, [rows, filters, ownersMap]);

  // deschide formular pentru creare
  function openCreateForm() {
    setForm({ name: '', species: '', breed: '', ownerId: '' });
    setEditingId(null);
    setShowForm(true);

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 250);
    });
  }

  // ------- CRUD form -------
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
      setShowForm(false); // ca la Owners: îl închidem după salvare
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
      const msg =
        e?.response?.data?.error ||
        (typeof e?.response?.data === 'string' ? e.response.data : null) ||
        'Ștergerea a eșuat.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p) {
    // încercăm mai întâi id-ul direct
    let ownerId = p.ownerId ? String(p.ownerId) : '';

    // dacă nu avem ownerId, încercăm să-l găsim după nume
    if (!ownerId) {
      const norm = (s) => (s || '').toString().trim().toLowerCase();
      const targetName = norm(p.ownerName);

      if (targetName) {
        const found = owners.find((o) => norm(o.name) === targetName);
        if (found) {
          ownerId = String(found.id);
        }
      }
    }

    setForm({
      name: p.name || '',
      species: p.species || '',
      breed: p.breed || '',
      ownerId: ownerId || '',
    });
    setEditingId(p.id);
    setShowForm(true);

    // scroll la formular + focus pe Name
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 250);
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', species: '', breed: '', ownerId: '' });
    setShowForm(false);
  }

  // ------- render -------
  return (
    <section>
      <div className="page-header">
        <h2>🐶 Pets</h2>
        <button
          className="btn btn-primary"
          onClick={openCreateForm}
          disabled={loading}
        >
          + Add Pet
        </button>
      </div>

      {/* Form Add/Edit – afișat doar când showForm = true */}
      {showForm && (
        <div className="card form-card" ref={formRef}>
          <h3>{editingId ? 'Edit pet' : 'Add pet'}</h3>
          <form onSubmit={submitPet}>
            <div className="form-group" style={{ maxWidth: 360 }}>
              <label>Name</label>
              <input
                ref={firstFieldRef}
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Species</label>
                <input
                  value={form.species}
                  onChange={e => setForm({ ...form, species: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input
                  value={form.breed}
                  onChange={e => setForm({ ...form, breed: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select
                  required
                  value={form.ownerId}
                  onChange={e => setForm({ ...form, ownerId: e.target.value })}
                >
                  <option value="">— Choose owner —</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Create'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bara de filtre */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label>Species</label>
            <input
              value={filters.species}
              onChange={e => setFilters({ ...filters, species: e.target.value })}
              placeholder="dog, cat, etc."
            />
          </div>

          <div className="form-group">
            <label>Search (pet / owner)</label>
            <input
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholder="name / breed / owner"
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchAll}
            >
              Apply filters
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFilters({ species: '', q: '' });
                fetchAll();
              }}
            >
              Delete filters
            </button>
          </div>
        </div>
      </div>

      {/* Listă */}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : filteredRows.length ? (
        <>
          <div className="card" style={{ marginBottom: 0 }}>
            <span className="owner-phone">
              {filteredRows.length} pet{filteredRows.length === 1 ? '' : 's'} găsit(e)
            </span>
          </div>
          <div className="pets-grid">
            {filteredRows.map(p => (
              <div key={p.id} className="card pet-card">
                <div className="pet-info">
                  <h3>{p.name}</h3>
                  <div className="pet-species">{p.species || '—'}</div>
                  {p.breed && <div className="pet-breed">Breed: {p.breed}</div>}
                  <div className="pet-owner">
                    Owner:{' '}
                    {p.ownerName ||
                      ownersMap.get(String(p.ownerId)) ||
                      '—'}
                  </div>
                </div>
                <div className="pet-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => startEdit(p)}
                  >
                    Edit pet
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(p.id)}
                  >
                    Delete pet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>There are no results for the current filters.</p>
        </div>
      )}
    </section>
  );
}
