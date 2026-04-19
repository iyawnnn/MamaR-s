import axios, { InternalAxiosRequestConfig } from 'axios';
import { IExpense, IOrder } from '../types';

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const fetchOrders = async (status?: string): Promise<IOrder[]> => {
  // If status is 'all', we pass no query params to get everything
  const params = status && status !== 'all' ? { status: status.toUpperCase() } : {};
  const response = await api.get<IOrder[]>('/orders', { params });
  return response.data;
};

export const fetchExpenses = async (): Promise<IExpense[]> => {
  const response = await api.get<IExpense[]>('/expenses');
  return response.data;
};

export const createExpense = async (data: Partial<IExpense>): Promise<IExpense> => {
  const response = await api.post<IExpense>('/expenses', data);
  return response.data;
};

export const updateOrderStatus = async (
  id: string, 
  updates: { status?: string; paymentStatus?: string; amountPaid?: number }
): Promise<IOrder> => {
  const response = await api.patch<IOrder>(`/orders/${id}/status`, updates);
  return response.data;
};

export const updateOrder = async (id: string, data: Partial<IOrder>): Promise<IOrder> => {
  const response = await api.patch<IOrder>(`/orders/${id}`, data);
  return response.data;
};

export const createOrder = async (data: Partial<IOrder>): Promise<IOrder> => {
  const response = await api.post<IOrder>('/orders', data);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

export const updateExpense = async (id: string, data: Partial<IExpense>): Promise<IExpense> => {
  const response = await api.patch<IExpense>(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

export default api;