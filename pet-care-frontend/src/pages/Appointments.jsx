import { useEffect, useState } from 'react';
import AppointmentsService from '../services/appointments';
import OwnersService from '../services/owners';
import PetsService from '../services/pets';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    dateTime: '', 
    description: '', 
    ownerId: '', 
    petId: '' 
  });

  useEffect(() => {
    loadOwners();
    loadPets();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (form.ownerId) {
      loadPetsByOwner(Number(form.ownerId));
    } else {
      setFilteredPets([]);
    }
  }, [form.ownerId]);

  async function loadOwners() {
    try {
      const data = await OwnersService.list();
      setOwners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading owners:', e);
    }
  }

  async function loadPets() {
    try {
      const data = await PetsService.list();
      setPets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading pets:', e);
    }
  }

  async function loadPetsByOwner(ownerId) {
    try {
      const data = await PetsService.byOwner(ownerId);
      setFilteredPets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading pets by owner:', e);
      setFilteredPets([]);
    }
  }

  async function loadAppointments() {
    setLoading(true);
    setError('');
    try {
      const data = await AppointmentsService.list();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Nu am putut încărca appointments. Verifică conexiunea la backend.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ dateTime: '', description: '', ownerId: '', petId: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
    setFilteredPets([]);
  }

  async function startEdit(appointment) {
    // Format dateTime for input (YYYY-MM-DDTHH:mm)
    const dateTime = appointment.dateTime 
      ? new Date(appointment.dateTime).toISOString().slice(0, 16)
      : '';
    
    // Find owner by name
    const owner = owners.find(o => o.name === appointment.ownerName);
    const ownerId = owner ? owner.id.toString() : '';
    
    // Find pet by name
    let petId = '';
    if (owner) {
      try {
        const petsForOwner = await PetsService.byOwner(owner.id);
        const pet = Array.isArray(petsForOwner) 
          ? petsForOwner.find(p => p.name === appointment.petName)
          : null;
        if (pet) {
          petId = pet.id.toString();
        }
      } catch (e) {
        console.error('Error loading pets for owner:', e);
      }
    }
    
    setForm({
      dateTime: dateTime,
      description: appointment.description || '',
      ownerId: ownerId,
      petId: petId,
    });
    setEditingId(appointment.id);
    setShowForm(true);
    setError('');
    setSuccess('');
    
    // Load pets for owner to populate dropdown
    if (owner) {
      loadPetsByOwner(owner.id);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Convert dateTime to ISO string format
      const dateTimeISO = new Date(form.dateTime).toISOString();
      
      const appointmentData = {
        dateTime: dateTimeISO,
        description: form.description,
        owner: { id: Number(form.ownerId) },
        pet: { id: Number(form.petId) }
      };

      if (editingId) {
        await AppointmentsService.update(editingId, appointmentData);
        setSuccess('Appointment actualizat cu succes!');
      } else {
        await AppointmentsService.create(appointmentData);
        setSuccess('Appointment creat cu succes!');
      }
      resetForm();
      loadAppointments();
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
    if (!window.confirm('Ești sigur că vrei să ștergi această programare?')) return;
    
    setLoading(true);
    setError('');
    try {
      await AppointmentsService.remove(id);
      setSuccess('Appointment șters cu succes!');
      loadAppointments();
    } catch (e) {
      console.error(e);
      setError('Nu am putut șterge appointment-ul.');
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '—';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const petsToShow = form.ownerId ? filteredPets : pets;

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h2>📅 Appointments</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={loading}
        >
          + Adaugă Appointment
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Editează Appointment' : 'Adaugă Appointment Nou'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Data și Ora *</label>
              <input
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
              <small>Selectează o dată și oră viitoare</small>
            </div>
            <div className="form-group">
              <label>Descriere *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descriere appointment"
                rows={4}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Owner *</label>
                <select
                  required
                  value={form.ownerId}
                  onChange={(e) => {
                    setForm({ ...form, ownerId: e.target.value, petId: '' });
                  }}
                >
                  <option value="">Selectează owner</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Pet *</label>
                <select
                  required
                  value={form.petId}
                  onChange={(e) => setForm({ ...form, petId: e.target.value })}
                  disabled={!form.ownerId || filteredPets.length === 0}
                >
                  <option value="">
                    {!form.ownerId 
                      ? 'Selectează mai întâi owner' 
                      : filteredPets.length === 0 
                        ? 'Nu există pets pentru acest owner'
                        : 'Selectează pet'}
                  </option>
                  {petsToShow.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>
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

      {!loading && appointments.length === 0 && !showForm && (
        <div className="empty-state">
          <p>Nu există appointments încă. Adaugă primul appointment!</p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card appointment-card">
              <div className="appointment-info">
                <div className="appointment-header">
                  <h3>{formatDateTime(appointment.dateTime)}</h3>
                </div>
                <p className="appointment-description">{appointment.description}</p>
                <div className="appointment-details">
                  <span className="appointment-owner">👤 Owner: {appointment.ownerName || '—'}</span>
                  <span className="appointment-pet">🐾 Pet: {appointment.petName || '—'}</span>
                </div>
              </div>
              <div className="appointment-actions">
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => startEdit(appointment)}
                  disabled={loading}
                >
                  Editează
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => handleDelete(appointment.id)}
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
