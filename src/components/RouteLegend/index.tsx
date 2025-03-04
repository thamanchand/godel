import React from 'react';

import { Route } from '../../services/api/routeService';

interface RouteLegendProps {
  route?: Route | null;
}

const SEGMENT_COLORS = [
  '#FF5733', // Bright red-orange
  '#33A8FF', // Bright blue
  '#33FF57', // Bright green
  '#FF33A8', // Bright pink
  '#A833FF', // Bright purple
  '#FFD700', // Gold
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FF8C00', // Dark orange
  '#8A2BE2', // Blue violet
  '#32CD32', // Lime green
  '#DC143C', // Crimson
];

const RouteLegend: React.FC<RouteLegendProps> = ({ route }) => {
  if (!route) {
    return null;
  }

  const { points, segments } = route;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Details</h3>
      <div className="space-y-2">
        {points.map((point, index) => {
          const isSource = index === 0;
          const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                {isSource ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mb-1">
                    <i className="fa fa-home text-white text-sm"></i>
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: color }} />
                )}
                {index < points.length - 1 && (
                  <div className="w-0.5 flex-grow" style={{ backgroundColor: color }} />
                )}
              </div>
              <div className="flex-grow">
                <span className="text-sm font-medium text-gray-900">{point.name}</span>
                {index < points.length - 1 && segments[index] && (
                  <div className="text-xs text-gray-500 mt-1">
                    {segments[index].distance.toFixed(2)} km • {segments[index].duration} min
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteLegend;
