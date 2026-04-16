import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add these for your new Expense feature
export const createExpense = async (data) => (await api.post('/expenses', data)).data;
export const fetchExpenses = async () => (await api.get('/expenses')).data;

export default api;