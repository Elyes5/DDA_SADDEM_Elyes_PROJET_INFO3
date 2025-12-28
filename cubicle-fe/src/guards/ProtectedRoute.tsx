import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';

export const ProtectedRoute = () => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading && !user) return null; 

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading && !user) return null;

  return user ? <Navigate to="/home" replace /> : <Outlet />;
};