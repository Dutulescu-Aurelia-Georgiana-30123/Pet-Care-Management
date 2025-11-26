import { api } from '../api/client';

const Auth = {
  login:    (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
};

export default Auth;
