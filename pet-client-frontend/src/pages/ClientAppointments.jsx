// src/pages/ClientAppointments.jsx
import { useEffect, useState } from "react";
import Appointments from "../services/appointments.js";
import Pets from "../services/pets.js";

export default function ClientAppointments({ owner }) {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petId, setPetId] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  // încărcăm pets + appointments pentru owner-ul logat
  useEffect(() => {
    if (!owner?.id) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [petsRes, apptRes] = await Promise.all([
          Pets.byOwner(owner.id).catch(() => []),
          Appointments.byOwner(owner.id).catch(() => []),
        ]);

        setPets(Array.isArray(petsRes) ? petsRes : []);
        setAppointments(Array.isArray(apptRes) ? apptRes : []);
      } catch (e) {
        console.error("load appointments error", e);
        setError("Could not load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [owner?.id]);

  function resetForm() {
    setDate("");
    setTime("");
    setPetId("");
    setDescription("");
    setError("");
  }

  // nu permitem programări în trecut
  function validateNotPast(dateStr, timeStr) {
    if (!dateStr || !timeStr) {
      return "Please fill in date and time.";
    }
    const combined = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();

    if (combined.getTime() < now.getTime()) {
      return "You cannot create appointments in the past.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!owner?.id) {
      setError("You must be logged in as an owner.");
      return;
    }
    if (!petId) {
      setError("Please choose a pet.");
      return;
    }

    const validationMsg = validateNotPast(date, time);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    const payload = {
      // Spring LocalDateTime – trimitem "YYYY-MM-DDTHH:mm"
      dateTime: `${date}T${time}`,
      description: description.trim() || "Veterinary appointment",
      owner: { id: owner.id },
      pet: { id: Number(petId) },
    };

    setLoading(true);
    try {
      await Appointments.create(payload);
      const apptRes = await Appointments.byOwner(owner.id).catch(() => []);
      setAppointments(Array.isArray(apptRes) ? apptRes : []);
      resetForm();
    } catch (err) {
      console.error("save appointment error", err?.response?.data || err);
      setError(
        err?.response?.data?.error ||
          "Failed to save appointment. Please check the fields."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this appointment?")) return;

    setLoading(true);
    try {
      await Appointments.remove(id);
      const apptRes = await Appointments.byOwner(owner.id).catch(() => []);
      setAppointments(Array.isArray(apptRes) ? apptRes : []);
    } catch (err) {
      console.error("delete appointment error", err);
      alert("Could not delete appointment.");
    } finally {
      setLoading(false);
    }
  }

  // pentru atributul min la input[type=date]
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="client-page">
      <div className="client-page-inner">
        {/* header My Appointments + buton "New appointment" */}
        <div className="client-page-header-row">
          <h2 className="client-page-title">
            My Appointments <span>📅</span>
          </h2>

          <button
            type="button"
            className="client-page-add-btn"
            onClick={() => {
              document
                .getElementById("appointment-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            + New appointment
          </button>
        </div>

        {/* card cu formularul de creare */}
        <div id="appointment-form" className="client-card">
          <h3 className="client-card-title">New appointment</h3>

          {error && <div className="client-error-banner">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="client-form-row">
              <div className="auth-field client-form-field">
                <label className="auth-label">Date *</label>
                <input
                  className="auth-input"
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field client-form-field">
                <label className="auth-label">Time *</label>
                <input
                  className="auth-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field client-form-field">
                <label className="auth-label">Pet *</label>
                <select
                  className="auth-input"
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  required
                >
                  <option value="">— choose pet —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.species ? `(${p.species})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Description</label>
              <input
                className="auth-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Consultation / vaccine / grooming…"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="auth-button" type="submit" disabled={loading}>
                Create
              </button>
              <button
                type="button"
                className="client-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* lista de programări */}
        {loading && !appointments.length ? (
          <div className="client-card">Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="client-card client-empty">
            You don&apos;t have any appointments yet. Click{" "}
            <b>&quot;New appointment&quot;</b> to create one!
          </div>
        ) : (
          appointments.map((a) => {
            const dateObj = a.dateTime ? new Date(a.dateTime) : null;

            // încercăm să deducem id-ul pet-ului, indiferent cum vine din backend
            const apptPetIdRaw =
              (a.pet && typeof a.pet === "object" && a.pet.id) ??
              (typeof a.pet === "number" || typeof a.pet === "string"
                ? a.pet
                : undefined) ??
              a.petId ??
              a.pet_id ??
              a.petID ??
              (a.pet && typeof a.pet === "object" && a.pet.petId) ??
              (a.pet && typeof a.pet === "object" && a.pet.pet_id);

            // căutăm pet-ul în lista de pets a owner-ului
            const pet =
              apptPetIdRaw != null
                ? pets.find((p) => String(p.id) === String(apptPetIdRaw))
                : undefined;

            // nume / specie / rasă – folosim tot ce găsim
            const petName =
              pet?.name ||
              (a.pet && typeof a.pet === "object" && a.pet.name) ||
              a.petName ||
              a.pet_name ||
              "Pet";

            const petSpecies =
              pet?.species ||
              (a.pet && typeof a.pet === "object" && a.pet.species) ||
              a.petSpecies ||
              a.pet_species;

            const petBreed =
              pet?.breed ||
              (a.pet && typeof a.pet === "object" && a.pet.breed) ||
              a.petBreed ||
              a.pet_breed;

            return (
              <div key={a.id} className="client-card client-appt-card">
                <div className="client-appt-main">
                  <div className="client-appt-title">
                    {petName} –{" "}
                    {dateObj
                      ? dateObj.toLocaleString()
                      : "Unknown date / time"}
                  </div>

                  <div className="client-appt-meta">
                    {petSpecies}
                    {petBreed ? ` · ${petBreed}` : ""}
                  </div>

                  <div className="client-appt-desc">
                    {a.description || "No description"}
                  </div>
                </div>

                <div className="client-pet-actions">
                  <button
                    type="button"
                    className="client-btn-danger"
                    onClick={() => handleDelete(a.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
