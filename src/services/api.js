// Substitua o conteúdo completo do seu api.js por este:

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '//192.168.3.9:3000/api',
  withCredentials: true
});

// Injeta o token JWT de forma automática no cabeçalho de todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;