import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error', err?.response || err);
    throw err;
  }
);
