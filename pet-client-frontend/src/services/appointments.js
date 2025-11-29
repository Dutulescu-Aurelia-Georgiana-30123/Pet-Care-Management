// src/services/appointments.js
import { api } from '../api/client';

const Appointments = {
  list:   (params)      => api.get('/appointments', { params }).then(r => r.data),
  get:    (id)          => api.get(`/appointments/${id}`).then(r => r.data),
  byOwner:(ownerId)     => api.get(`/appointments/owner/${ownerId}`).then(r => r.data),
  create: (data)        => api.post('/appointments', data).then(r => r.data),
  update: (id, data)    => api.put(`/appointments/${id}`, data).then(r => r.data),
  remove: (id)          => api.delete(`/appointments/${id}`).then(r => r.data),
};

export default Appointments;
