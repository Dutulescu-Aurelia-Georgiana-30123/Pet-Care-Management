import { useEffect, useState } from 'react';
import  Api  from '../services/appointments.js';
import { toast } from '../components/Toast.jsx';

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
 const [err, setErr] = useState(''); 
  // filtre
  const [ownerFilter, setOwnerFilter] = useState('');

  // formular create
  const [form, setForm] = useState({
    date: '',       // ex: 2025-11-10
    time: '',       // ex: 14:30
    description: '',
    ownerId: '',
    petId: '',
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
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
    if (!ownerFilter) { loadAll(); return; }
    setLoading(true);
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

  function validateForm() {
    const { date, time, description, ownerId, petId } = form;
    if (!date || !time) return 'Completează data și ora.';
    if (!description.trim()) return 'Descrierea este obligatorie.';
    if (!ownerId) return 'Owner ID este obligatoriu.';
    if (!petId) return 'Pet ID este obligatoriu.';
    return '';
  }

  async function onCreate(e) {
    e.preventDefault();

    const v = validateForm();
    if (v) { toast(v, 'error'); return; }

    const { date, time, description, ownerId, petId } = form;
    const dateTime = `${date}T${time}`; // LocalDateTime pe backend

    const payload = {
      dateTime,
      description: description.trim(),
      owner: { id: Number(ownerId) },
      pet:   { id: Number(petId) },
    };

    setLoading(true);
    try {
      await Api.create(payload);
      toast('Programare creată!', 'success');
      setForm({ date:'', time:'', description:'', ownerId:'', petId:'' });
      ownerFilter ? loadByOwner() : loadAll();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        (typeof e?.response?.data === 'string' ? e.response.data : null) ||
        (e?.response?.data && Object.values(e.response.data).join(', ')) ||
        'Crearea a eșuat. Verifică datele.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm('Ștergi această programare?')) return;
    setLoading(true);
    try {
      await Api.remove(id);
      toast('Programare ștearsă.', 'success');
      ownerFilter ? loadByOwner() : loadAll();
    } catch (e) {
      console.error(e);
      toast('Ștergerea a eșuat.', 'error');
    } finally {
      setLoading(false);
    }
  }

 return (
  <section>
    <h2>📅 Appointments</h2>

    {/* Filtru după owner */}
    <div className="card filters-card">
      <div className="filters-grid">
        <div className="form-group">
          <label>Owner ID</label>
          <input
            type="number"
            value={ownerFilter}
            onChange={(e)=>setOwnerFilter(e.target.value)}
            placeholder="ex: 3"
          />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={loadByOwner}>Load by owner</button>
          <button className="btn btn-secondary" onClick={()=>{ setOwnerFilter(''); loadAll(); }}>All</button>
        </div>
      </div>
    </div>

    {/* Formular creare */}
    <div className="card form-card">
      <h3>Adaugă programare</h3>
      <form onSubmit={onCreate}>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={form.time} onChange={(e)=>setForm({...form, time: e.target.value})}/>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e)=>setForm({...form, description: e.target.value})}
            placeholder="Consultation / Vaccine / Grooming"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Owner ID</label>
            <input type="number" value={form.ownerId} onChange={(e)=>setForm({...form, ownerId: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Pet ID</label>
            <input type="number" value={form.petId} onChange={(e)=>setForm({...form, petId: e.target.value})}/>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Create appointment</button>
        </div>
      </form>
    </div>

    {err && <div className="alert alert-error">{err}</div>}
    {loading && <div className="loading">Loading…</div>}

    {/* Listă */}
    {!loading && rows?.length > 0 && (
      <div className="appointments-list">
        {rows.map(a => (
          <div key={a.id} className="card appointment-card">
            <div className="appointment-info">
              <div className="appointment-header">
                <h3>{new Date(a.dateTime).toLocaleString()}</h3>
              </div>
              <div className="appointment-description">{a.description}</div>
              <div className="appointment-details">
                <span>👤 Owner: {a.ownerName || '—'}</span>
                <span>🐾 Pet: {a.petName || '—'}</span>
              </div>
            </div>
            <div className="appointment-actions">
              <button className="btn btn-danger" onClick={()=>onDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    )}

    {!loading && !rows?.length && (
      <div className="empty-state"><p>Nu există programări.</p></div>
    )}
  </section>
);
}
