import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: React.PropsWithChildren<unknown>) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
