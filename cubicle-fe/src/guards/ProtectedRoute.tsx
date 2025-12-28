import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';

// Only allows access if the user is authenticated
export const ProtectedRoute = () => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) return null; // Or a loading spinner

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Prevents logged-in users from accessing Login/Signup pages
export const PublicRoute = () => {
  const { user } = useAppSelector((state) => state.auth);
  return user ? <Navigate to="/home" replace /> : <Outlet />;
};