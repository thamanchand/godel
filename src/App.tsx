import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';
import './styles/mobile-overrides.css';

import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Modal from './components/common/Modal';
import { supabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log('Setting up auth state listener');

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user ? 'User found' : 'No user');
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user ? 'User found' : 'No user');
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('[Route] Current path:', location.pathname);
    console.log('[Route] User state:', user);
  }, [location.pathname, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Landing />
        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Sign In">
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Modal>
      </>
    );
  }

  console.log('[App] Rendering routes. Path:', location.pathname, 'User:', user);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
