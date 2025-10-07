import axios from 'axios';

const viteUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL;
const baseURL = viteUrl || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
