import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  requireAnyRole?: string[];
}

export function ProtectedRoute({ requireAnyRole }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAnyRole && !requireAnyRole.some((role) => user?.roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
