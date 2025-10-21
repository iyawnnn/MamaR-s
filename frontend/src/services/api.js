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
