import { useEffect, useState } from 'react';
import Pets from '../services/pets.js';

export default function PetsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ ownerId: '', species: '', q: '' });
  const [form, setForm] = useState({ name: '', species: '', breed: '', ownerId: '' });

  async function fetchAll() { setLoading(true); try { setRows(await Pets.list(filters)); } finally { setLoading(false); } }
  useEffect(() => { fetchAll(); }, []);
  const applyFilters = () => fetchAll();

  async function createPet(e) {
    e.preventDefault();
    const body = { name: form.name, species: form.species || undefined, breed: form.breed || undefined, owner: { id: Number(form.ownerId) } };
    await Pets.create(body);
    setForm({ name:'', species:'', breed:'', ownerId:'' });
    fetchAll();
  }

  return (
    <section className="p-4 text-left grid gap-6">
      <h2 className="text-2xl font-bold">🐶 Pets</h2>

      {/* Filtre */}
      <div className="flex flex-wrap gap-3 items-end">
        <label className="grid">
          <span>Search</span>
          <input className="border rounded p-2" value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} placeholder="name/breed" />
        </label>
        <label className="grid">
          <span>Species</span>
          <input className="border rounded p-2" value={filters.species} onChange={e=>setFilters({...filters, species:e.target.value})} placeholder="dog/cat" />
        </label>
        <label className="grid">
          <span>Owner ID</span>
          <input type="number" className="border rounded p-2" value={filters.ownerId} onChange={e=>setFilters({...filters, ownerId:e.target.value})} />
        </label>
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={applyFilters}>Apply</button>
        <button className="border px-3 py-2 rounded" onClick={()=>{ setFilters({ ownerId:'', species:'', q:'' }); fetchAll(); }}>Clear</button>
      </div>

      {/* Create */}
      <form onSubmit={createPet} className="grid gap-3 max-w-xl">
        <div className="font-semibold">Create pet</div>
        <label className="grid">
          <span>Name</span>
          <input className="border rounded p-2" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid">
            <span>Species</span>
            <input className="border rounded p-2" value={form.species} onChange={e=>setForm({...form, species:e.target.value})}/>
          </label>
          <label className="grid">
            <span>Breed</span>
            <input className="border rounded p-2" value={form.breed} onChange={e=>setForm({...form, breed:e.target.value})}/>
          </label>
        </div>
        <label className="grid">
          <span>Owner ID</span>
          <input type="number" className="border rounded p-2" required value={form.ownerId} onChange={e=>setForm({...form, ownerId:e.target.value})}/>
        </label>
        <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded w-fit">Create</button>
      </form>

      {/* Listă */}
      {loading ? <div>Loading...</div> : (
        <div className="grid gap-3">
          {rows.map(p => (
            <div key={p.id} className="border rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="opacity-80">{p.species || '—'} {p.breed && <>• {p.breed}</>}</div>
                <div className="text-sm opacity-70">Owner: {p.ownerName || '—'}</div>
              </div>
              <div className="flex gap-2">
                <button className="border px-3 py-2 rounded" onClick={async ()=>{ await Pets.remove(p.id); fetchAll(); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
