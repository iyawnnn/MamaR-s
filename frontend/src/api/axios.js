// frontend/src/api/axios.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Basic axios instance. Update headers for auth when you implement JWT.
const instance = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// For dev - include dev token for protected endpoints
instance.devAuth = (token = 'devtoken') => {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default instance;
