import { User } from '@supabase/supabase-js';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  const location = useLocation();
  console.log('[ProtectedRoute] Checking access. Path:', location.pathname, 'User:', !!user);

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to landing page');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
