import axios from 'axios';

// Ensure the trailing slash is removed from the .env variable
const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to automatically attach token
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

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

export const fetchExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export default api;