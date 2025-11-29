// src/services/pets.js
import { api } from '../api/client';

const Pets = {
  list: (params) => api.get('/pets', { params }).then((r) => r.data),
  get: (id) => api.get(`/pets/${id}`).then((r) => r.data),
  byOwner: (ownerId) => api.get(`/pets/owner/${ownerId}`).then((r) => r.data),
  create: (data) => api.post('/pets', data).then((r) => r.data),
  update: (id, data) => api.put(`/pets/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/pets/${id}`).then((r) => r.data),
};

export default Pets;
