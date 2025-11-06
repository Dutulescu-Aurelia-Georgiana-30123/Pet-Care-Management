import { api } from '../api/client';

const Owners = {
  list:   () => api.get('/owners').then(r => r.data),
  create: (data) => api.post('/owners', data).then(r => r.data),
  update: (id, data) => api.put(`/owners/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/owners/${id}`).then(r => r.data),
};

export default Owners;
