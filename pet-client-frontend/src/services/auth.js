// src/services/auth.js
import { api } from '../api/client';

const Auth = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  register: (payload) =>
    api.post('/auth/register', payload).then(r => r.data),
};

export default Auth;
