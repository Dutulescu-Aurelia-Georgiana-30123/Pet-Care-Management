// src/services/pets.js
import { api } from '../api/client';

const Pets = {
  byOwner: (ownerId) =>
    api.get(`/pets/owner/${ownerId}`).then((r) => r.data),

  createForOwner: (ownerId, data) =>
    api
      .post('/pets', {
        name: data.name,
        species: data.species || null,
        breed: data.breed || null,
        owner: { id: ownerId },
      })
      .then((r) => r.data),

  update: (id, ownerId, data) =>
    api
      .put(`/pets/${id}`, {
        name: data.name,
        species: data.species || null,
        breed: data.breed || null,
        owner: { id: ownerId },
      })
      .then((r) => r.data),

  remove: (id) => api.delete(`/pets/${id}`).then((r) => r.data),
};

export default Pets;
