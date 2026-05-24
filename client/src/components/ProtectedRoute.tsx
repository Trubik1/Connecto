import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = Boolean(localStorage.getItem('currentUserId') || localStorage.getItem('organizerId'));
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}
