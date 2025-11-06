import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

console.log('API base:', import.meta.env.VITE_API_URL);

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error', err?.response || err);
    throw err;
  }
);
