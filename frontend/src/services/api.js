import axios from 'axios';

const api = axios.create({
  // Hardcoded to the NEW port 5001
  baseURL: 'http://localhost:5001/api', 
  // Increased to 10 seconds
  timeout: 10000, 
});

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

export const createExpense = async (data) => (await api.post('/expenses', data)).data;
export const fetchExpenses = async () => (await api.get('/expenses')).data;

export default api;