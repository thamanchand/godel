import { User } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';

import { DEFAULT_POSITION } from '../../constants';
import { useRouteData } from '../../hooks/useRouteData';

import FloatingButton from '../common/FloatingButton';
import Map from '../Map/Map';
import Modal from '../common/Modal';
import RouteForm from '../RouteForm/RouteForm';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  console.log('[Dashboard] Rendering for user:', user.email);

  const [mapPosition, setMapPosition] = useState<[number, number]>([
    DEFAULT_POSITION.lat,
    DEFAULT_POSITION.lng,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { route, isCalculating, error, calculateRoute } = useRouteData();

  useEffect(() => {
    if (route && route.points.length > 0) {
      const source = route.points[0];
      setMapPosition([source.lat, source.lon]);
    }
  }, [route]);

  useEffect(() => {
    if (isCalculating) {
      setIsModalOpen(false);
    }
  }, [isCalculating]);

  const handleCalculateRoute = (...args: Parameters<typeof calculateRoute>) => {
    calculateRoute(...args);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 p-4 h-screen overflow-hidden max-w-screen">
        {error && (
          <div className="col-span-full bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 border-l-4 border-red-500">
            {error}
          </div>
        )}

        {/* Desktop view - side panel always visible */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md p-4 h-full overflow-hidden">
          <RouteForm
            onCalculateRoute={calculateRoute}
            isCalculating={isCalculating}
            route={route}
          />
        </div>

        <div className="h-full overflow-hidden rounded-lg border border-gray-200 shadow-md relative">
          <Map
            position={mapPosition}
            onPositionChange={setMapPosition}
            route={route}
            isCalculating={isCalculating}
          />
        </div>

        {/* Mobile view - floating button and modal */}
        <div className="lg:hidden">
          <FloatingButton onClick={() => setIsModalOpen(true)} label="Optimize Route" />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Optimize Delivery Route"
        >
          <RouteForm
            onCalculateRoute={handleCalculateRoute}
            isCalculating={isCalculating}
            route={route}
          />
        </Modal>
      </main>
    </div>
  );
};

export default Dashboard;
