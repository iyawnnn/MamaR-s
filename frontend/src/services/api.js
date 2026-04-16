import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
});

export default axiosInstance;

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

export const fetchExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};
