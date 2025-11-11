import { useEffect, useState } from 'react';
import PetsService from '../services/pets';
import OwnersService from '../services/owners';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', species: '', breed: '', ownerId: '' });
  const [filters, setFilters] = useState({ ownerId: '', species: '' });

  useEffect(() => {
    loadOwners();
    loadPets();
  }, []);

  async function loadOwners() {
    try {
      const data = await OwnersService.list();
      setOwners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading owners:', e);
    }
  }

  async function loadPets() {
    setLoading(true);
    setError('');
    try {
      let data;
      if (filters.ownerId) {
        data = await PetsService.byOwner(Number(filters.ownerId));
      } else {
        data = await PetsService.list();
      }
      
      let filtered = Array.isArray(data) ? data : [];
      
      if (filters.species) {
        filtered = filtered.filter(p => 
          p.species?.toLowerCase().includes(filters.species.toLowerCase())
        );
      }
      
      setPets(filtered);
    } catch (e) {
      console.error(e);
      setError('Nu am putut încărca pets. Verifică conexiunea la backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
  }, [filters.ownerId, filters.species]);

  function resetForm() {
    setForm({ name: '', species: '', breed: '', ownerId: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  }

  function startEdit(pet) {
    // Find owner by name
    const owner = owners.find(o => o.name === pet.ownerName);
    const ownerId = owner ? owner.id.toString() : '';
    
    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      ownerId: ownerId,
    });
    setEditingId(pet.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const petData = {
        name: form.name,
        species: form.species,
        breed: form.breed,
        owner: { id: Number(form.ownerId) }
      };

      if (editingId) {
        await PetsService.update(editingId, petData);
        setSuccess('Pet actualizat cu succes!');
      } else {
        await PetsService.create(petData);
        setSuccess('Pet creat cu succes!');
      }
      resetForm();
      loadPets();
    } catch (e) {
      console.error(e);
      const errorMsg = e?.response?.data?.error || 
                      (typeof e?.response?.data === 'string' ? e.response.data : null) ||
                      Object.values(e?.response?.data || {}).join(', ') ||
                      'Eroare la salvare. Verifică datele introduse.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Ești sigur că vrei să ștergi acest pet?')) return;
    
    setLoading(true);
    setError('');
    try {
      await PetsService.remove(id);
      setSuccess('Pet șters cu succes!');
      loadPets();
    } catch (e) {
      console.error(e);
      setError('Nu am putut șterge pet-ul.');
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters({ ownerId: '', species: '' });
  }

  return (
    <div className="pets-page">
      <div className="page-header">
        <h2>🐶 Pets</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={loading}
        >
          + Adaugă Pet
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filtre */}
      <div className="card filters-card">
        <h3>Filtre</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Owner</label>
            <select
              value={filters.ownerId}
              onChange={(e) => setFilters({ ...filters, ownerId: e.target.value })}
            >
              <option value="">Toți owners</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Species</label>
            <input
              type="text"
              value={filters.species}
              onChange={(e) => setFilters({ ...filters, species: e.target.value })}
              placeholder="dog, cat, etc."
            />
          </div>
          <div className="form-group">
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Șterge Filtre
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Editează Pet' : 'Adaugă Pet Nou'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nume *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nume pet"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Species *</label>
                <input
                  type="text"
                  required
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                  placeholder="dog, cat, etc."
                />
              </div>
              <div className="form-group">
                <label>Breed *</label>
                <input
                  type="text"
                  required
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="Rasa"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Owner *</label>
              <select
                required
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              >
                <option value="">Selectează owner</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvare...' : (editingId ? 'Actualizează' : 'Creează')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && <div className="loading">Se încarcă...</div>}

      {!loading && pets.length === 0 && !showForm && (
        <div className="empty-state">
          <p>Nu există pets încă. Adaugă primul pet!</p>
        </div>
      )}

      {!loading && pets.length > 0 && (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.id} className="card pet-card">
              <div className="pet-info">
                <h3>{pet.name}</h3>
                <p className="pet-species">🐾 {pet.species || '—'}</p>
                <p className="pet-breed">Breed: {pet.breed || '—'}</p>
                <p className="pet-owner">Owner: {pet.ownerName || '—'}</p>
              </div>
              <div className="pet-actions">
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => startEdit(pet)}
                  disabled={loading}
                >
                  Editează
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => handleDelete(pet.id)}
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
