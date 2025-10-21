import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      navigate('/dashboard'); // redirect after successful login
    } catch (error) {
      setErr(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Admin Login</h2>
      <form onSubmit={onSubmit}>
        <label className="block mb-2">Email</label>
        <input
          className="w-full mb-3"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <label className="block mb-2">Password</label>
        <input
          className="w-full mb-3"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {err && <div className="text-red-500 mb-2">{err}</div>}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}
