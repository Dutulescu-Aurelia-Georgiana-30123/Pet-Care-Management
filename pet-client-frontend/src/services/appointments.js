// src/services/appointments.js
import { api } from '../api/client';

const Appointments = {
  byOwner: (ownerId) =>
    api.get(`/appointments/owner/${ownerId}`).then((r) => r.data),

  createForOwner: (ownerId, petId, data) =>
    api
      .post('/appointments', {
        dateTime: `${data.date}T${data.time}`,
        description: data.description,
        owner: { id: ownerId },
        pet: { id: petId },
      })
      .then((r) => r.data),

  update: (id, ownerId, petId, data) =>
    api
      .put(`/appointments/${id}`, {
        dateTime: `${data.date}T${data.time}`,
        description: data.description,
        owner: { id: ownerId },
        pet: { id: petId },
      })
      .then((r) => r.data),

  remove: (id) => api.delete(`/appointments/${id}`).then((r) => r.data),
};

export default Appointments;
