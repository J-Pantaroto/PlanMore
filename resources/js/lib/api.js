import axios from 'axios';
import route from 'ziggy-js';

const api = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Adiciona CSRF automático a partir da meta tag do Blade
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  if (token) config.headers['X-CSRF-TOKEN'] = token;
  return config;
});

export { api, route };