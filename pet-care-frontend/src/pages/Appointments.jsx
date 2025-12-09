import { useEffect, useMemo, useRef, useState } from 'react';
import Api from '../services/appointments.js';
import OwnersApi from '../services/owners.js';
import PetsApi from '../services/pets.js';
import { toast } from '../components/Toast.jsx';

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // dropdown-uri
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);

  // filtru listă
  const [ownerFilter, setOwnerFilter] = useState('');

  // interval de date (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // formular (Add/Edit)
  const [form, setForm] = useState({
    date: '',
    time: '',
    description: '',
    ownerId: '',
    petId: '',
  });
  const [editingId, setEditingId] = useState(null);

  // scroll & focus
  const formRef = useRef(null);
  const firstFieldRef = useRef(null);

  // helpers
  function normalizePetsWithOwners(petsRaw, ownersList) {
    if (!Array.isArray(petsRaw)) return [];
    const byName = new Map(
      (ownersList || []).map((o) => [String(o.name).trim().toLowerCase(), String(o.id)])
    );

    return petsRaw.map((p) => {
      let ownerId =
        p.ownerId ??
        p.owner_id ??
        p.ownerID ??
        (p.owner && (p.owner.id ?? p.owner.ownerId)) ??
        null;

      if (!ownerId) {
        const ownerName =
          (typeof p.owner === 'object' && p.owner?.name) ||
          p.ownerName ||
          p.owner_name ||
          null;
        if (ownerName) {
          const guess = byName.get(String(ownerName).trim().toLowerCase());
          if (guess) ownerId = guess;
        }
      }

      const name = p.name ?? p.petName ?? p.pet_name ?? '';
      return { ...p, ownerId: ownerId ? String(ownerId) : null, name };
    });
  }

  const petsForSelectedOwner = useMemo(() => {
    if (!form.ownerId) return [];
    return pets.filter((p) => String(p.ownerId) === String(form.ownerId));
  }, [pets, form.ownerId]);

  // auto-select dacă e un singur pet
  useEffect(() => {
    if (!form.ownerId) return;
    if (petsForSelectedOwner.length === 1) {
      const only = petsForSelectedOwner[0];
      if (String(form.petId) !== String(only.id)) {
        setForm((f) => ({ ...f, petId: String(only.id) }));
      }
    }
  }, [form.ownerId, petsForSelectedOwner]); 

  useEffect(() => {
    loadRefs();
    loadAll();
  }, []);

  async function loadRefs() {
    try {
      const [ownersData, petsDataRaw] = await Promise.all([
        OwnersApi.list().catch(() => []),
        PetsApi.list().catch(() => []),
      ]);
      const ownersArr = Array.isArray(ownersData) ? ownersData : [];
      const petsArr = normalizePetsWithOwners(petsDataRaw, ownersArr);

      setOwners(ownersArr);
      setPets(petsArr);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca listele de owners/pets.', 'error');
    }
  }

  async function loadAll() {
    setLoading(true);
    setErr('');
    try {
      const data = await Api.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca programările.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadByOwner() {
    if (!ownerFilter) {
      loadAll();
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const data = await Api.byOwner(ownerFilter);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast('Nu am putut încărca programările pentru owner.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // form
  function validateForm() {
    const { date, time, description, ownerId, petId } = form;
    if (!date || !time) return 'Complete date & hour.';
    if (!description.trim()) return 'Description is required.';
    if (!ownerId) return 'Select owner.';
    if (!petId) return 'Select pet.';
    return '';
  }

  function resetForm() {
    setForm({ date: '', time: '', description: '', ownerId: '', petId: '' });
    setEditingId(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validateForm();
    if (v) {
      toast(v, 'error');
      return;
    }

    const { date, time, description, ownerId, petId } = form;
    const payload = {
      dateTime: `${date}T${time}`,
      description: description.trim(),
      owner: { id: Number(ownerId) },
      pet: { id: Number(petId) },
    };

    setLoading(true);
    try {
      if (editingId) {
        await Api.update(editingId, payload);
        toast('Updated schedule!', 'success');
      } else {
        await Api.create(payload);
        toast('Created schedule!', 'success');
      }
      resetForm();
      ownerFilter ? loadByOwner() : loadAll();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        (typeof e?.response?.data === 'string' ? e.response.data : null) ||
        (e?.response?.data && Object.values(e.response.data).join(', ')) ||
        (editingId ? 'Actualizarea a eșuat.' : 'Crearea a eșuat.');
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function startEdit(a) {
    // split date/time
    const d = new Date(a.dateTime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    let ownerId = a.ownerId ? String(a.ownerId) : '';
    let petId = a.petId ? String(a.petId) : '';

    // fallback: GET /appointments/{id}
    if (!ownerId || !petId) {
      try {
        const full = await (Api.get ? Api.get(a.id) : Promise.resolve(null));
        if (full) {
          if (!ownerId && full.owner?.id != null) ownerId = String(full.owner.id);
          if (!petId && full.pet?.id != null) petId = String(full.pet.id);
        }
      } catch {
        /* ignore */
      }
    }

    // fallback după nume
    const norm = (s) => (s || '').toString().trim().toLowerCase();
    if (!ownerId && a.ownerName) {
      const fo = owners.find((o) => norm(o.name) === norm(a.ownerName));
      if (fo) ownerId = String(fo.id);
    }
    if (!petId && a.petName) {
      const candidates = ownerId
        ? pets.filter((p) => String(p.ownerId) === String(ownerId))
        : pets;
      const fp = candidates.find((p) => norm(p.name) === norm(a.petName));
      if (fp) petId = String(fp.id);
    }

    setForm({
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
      description: a.description || '',
      ownerId: ownerId || '',
      petId: petId || '',
    });
    setEditingId(a.id);

    requestAnimationFrame(() => {
      formRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => firstFieldRef?.current?.focus(), 250);
    });
  }

  async function onDelete(id) {
    if (!confirm('Are you deleting this schedule?')) return;
    setLoading(true);
    try {
      await Api.remove(id);
      toast('Deleted scheldule', 'success');
      ownerFilter ? loadByOwner() : loadAll();
    } catch (e) {
      console.error(e);
      toast('Ștergerea a eșuat.', 'error');
    } finally {
      setLoading(false);
    }
  }

  //  grupare, sortare si interval 
  const grouped = useMemo(() => {
    const list = Array.isArray(rows) ? [...rows] : [];
    // sortare cronologică
    list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // filtrare după interval (inclusiv capetele)
    const start = fromDate ? new Date(fromDate) : null;
    const end   = toDate   ? new Date(`${toDate}T23:59:59`) : null;
    const inRange = (dt) =>
      (!start || dt >= start) &&
      (!end   || dt <= end);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const today = [];
    const upcoming = [];
    const past = [];

    for (const a of list) {
      const dt = new Date(a.dateTime);
      if (!inRange(dt)) continue;

      if (dt < startOfToday) {
        past.push(a);
      } else if (dt.toDateString() === now.toDateString()) {
        today.push(a);
      } else {
        upcoming.push(a);
      }
    }

    return { today, upcoming, past };
  }, [rows, fromDate, toDate]);

  const [showPast, setShowPast] = useState(false);

  //  render 
  return (
    <section>
      <h2>📅 Appointments</h2>

      {/* Formular Add/Edit */}
      <div className="card form-card" ref={formRef}>
        <h3>{editingId ? 'Edit appointment' : 'Add appointment'}</h3>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                ref={firstFieldRef}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Consultation / Vaccine / Grooming"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Owner</label>
              <select
                value={form.ownerId}
                onChange={(e) =>
                  setForm({ ...form, ownerId: e.target.value, petId: '' })
                }
                required
              >
                <option value="">— Choose owner —</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Pet</label>
              <select
                value={form.petId}
                onChange={(e) => setForm({ ...form, petId: e.target.value })}
                required
                disabled={!form.ownerId}
              >
                <option value="">
                  {form.ownerId ? '— Choose pet —' : 'Select owner first'}
                </option>
                {petsForSelectedOwner.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {editingId ? 'Save changes' : 'Create appointment'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {/* Filtre (owner + interval) */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label>Appointments by owner</label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              disabled={loading}
            >
              <option value="">All owners</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: 'end' }}>
            <button className="btn btn-primary" onClick={loadByOwner} disabled={loading}>
              Load by owner
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setOwnerFilter('');
                loadAll();
              }}
              disabled={loading}
            >
              All
            </button>
          </div>

          <div className="form-group">
            <label>From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ alignSelf: 'end', display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const str = `${yyyy}-${mm}-${dd}`;
                setFromDate(str);
                setToDate(str);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const today = new Date();
                const next7 = new Date(today);
                next7.setDate(next7.getDate() + 7);
                const fmt = (d) =>
                  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
                    d.getDate()
                  ).padStart(2, '0')}`;
                setFromDate(fmt(today));
                setToDate(fmt(next7));
              }}
            >
              Next 7 days
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
            >
              Reset interval
            </button>
          </div>
        </div>
      </div>

      {/* Listă programări (grupată) */}
      {!loading && (grouped.today.length || grouped.upcoming.length || grouped.past.length) ? (
        <div className="appointments-list" style={{ gap: 24 }}>
          {/* Today */}
          {grouped.today.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Today</h3>
              {grouped.today.map((a) => (
                <Row key={a.id} a={a} onEdit={startEdit} onDelete={onDelete} loading={loading} />
              ))}
            </div>
          )}

          {/* Upcoming */}
          {grouped.upcoming.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Upcoming</h3>
              {grouped.upcoming.map((a) => (
                <Row key={a.id} a={a} onEdit={startEdit} onDelete={onDelete} loading={loading} />
              ))}
            </div>
          )}

          {/* Past (pliabil) */}
          {grouped.past.length > 0 && (
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3>Past</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowPast((s) => !s)}>
                  {showPast ? 'Hide' : 'Show'}
                </button>
              </div>
              {showPast &&
                grouped.past.map((a) => (
                  <Row key={a.id} a={a} onEdit={startEdit} onDelete={onDelete} loading={loading} />
                ))}
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="empty-state">
            <p>There are no appointments.</p>
          </div>
        )
      )}
    </section>
  );
}

/* componentă mică pentru un rând */
function Row({ a, onEdit, onDelete, loading }) {
  return (
    <div className="appointment-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div className="appointment-info" style={{ flex: 1 }}>
        <div className="appointment-header">
          <h3>{new Date(a.dateTime).toLocaleString()}</h3>
        </div>
        {a.description && <div className="appointment-description">{a.description}</div>}
        <div className="appointment-details">
          <span>👤 Owner: {a.ownerName || '—'}</span>
          <span>🐾 Pet: {a.petName || '—'}</span>
        </div>
      </div>
      <div className="appointment-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => onEdit(a)} disabled={loading}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(a.id)} disabled={loading}>
          Delete
        </button>
      </div>
    </div>
  );
}
