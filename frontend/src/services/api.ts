import axios, { InternalAxiosRequestConfig } from 'axios';
import { IExpense } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api', 
  timeout: 10000, 
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export const setToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const fetchExpenses = async (): Promise<IExpense[]> => {
  const response = await api.get<IExpense[]>('/expenses');
  return response.data;
};

export const createExpense = async (data: Partial<IExpense>): Promise<IExpense> => {
  const response = await api.post<IExpense>('/expenses', data);
  return response.data;
};

export default api;