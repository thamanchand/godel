import React, { useState, useEffect, useRef } from 'react';

import {
  isGoogleMapsLoaded,
  createAutocomplete,
  clearInstanceListeners,
  initGoogleMapsListener,
} from '../../services/googleMapsService';

interface RouteFormProps {
  onCalculateRoute: (source: string, intermediatePoints: string[], destination: string) => void;
  isCalculating?: boolean;
  route?: any; // Add route prop
}

const RouteForm: React.FC<RouteFormProps> = ({ onCalculateRoute, isCalculating }) => {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [intermediatePoints, setIntermediatePoints] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);

  // Refs for input elements
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const intermediateInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Refs for autocomplete instances
  const sourceAutocompleteRef = useRef<any>(null);
  const destAutocompleteRef = useRef<any>(null);
  const intermediateAutocompleteRefs = useRef<Array<any>>([]);

  // Check if Google Places API is loaded
  useEffect(() => {
    // Function to initialize Google Places API
    const initGooglePlaces = () => {
      if (isGoogleMapsLoaded()) {
        console.log('Google Places API is loaded and ready');
        setGoogleLoaded(true);
      } else {
        console.log('Google Places API not fully loaded yet');
      }
    };

    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      setGoogleLoaded(true);
      return;
    }

    // Set up listener for Google Maps API loading
    const cleanup = initGoogleMapsListener(initGooglePlaces);

    // Clean up
    return cleanup;
  }, []);

  // Initialize autocomplete when Google API is loaded
  useEffect(() => {
    if (!googleLoaded) {
      return;
    }

    console.log('Initializing Google Places Autocomplete');

    // Setup source autocomplete
    if (sourceInputRef.current) {
      try {
        // Create new autocomplete instance
        sourceAutocompleteRef.current = createAutocomplete(sourceInputRef.current, {
          componentRestrictions: { country: 'fi' },
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          types: ['geocode', 'establishment'],
        });

        // Add place_changed listener
        if (sourceAutocompleteRef.current) {
          sourceAutocompleteRef.current.addListener('place_changed', () => {
            const place = sourceAutocompleteRef.current.getPlace();
            if (place && place.formatted_address) {
              setSource(place.formatted_address);
            }
          });
        }

        // Prevent form submission on enter
        sourceInputRef.current.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') e.preventDefault();
        });
      } catch (error) {
        console.error('Error setting up source autocomplete:', error);
      }
    }

    // Setup destination autocomplete
    if (destInputRef.current) {
      try {
        // Create new autocomplete instance
        destAutocompleteRef.current = createAutocomplete(destInputRef.current, {
          componentRestrictions: { country: 'fi' },
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          types: ['geocode', 'establishment'],
        });

        // Add place_changed listener
        if (destAutocompleteRef.current) {
          destAutocompleteRef.current.addListener('place_changed', () => {
            const place = destAutocompleteRef.current.getPlace();
            if (place && place.formatted_address) {
              setDestination(place.formatted_address);
            }
          });
        }

        // Prevent form submission on enter
        destInputRef.current.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') e.preventDefault();
        });
      } catch (error) {
        console.error('Error setting up destination autocomplete:', error);
      }
    }

    // Setup autocomplete for intermediate points
    intermediateInputRefs.current.forEach((inputRef, index) => {
      if (inputRef) {
        try {
          // Create new autocomplete instance
          intermediateAutocompleteRefs.current[index] = createAutocomplete(inputRef, {
            componentRestrictions: { country: 'fi' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id'],
            types: ['geocode', 'establishment'],
          });

          // Add place_changed listener
          if (intermediateAutocompleteRefs.current[index]) {
            intermediateAutocompleteRefs.current[index].addListener('place_changed', () => {
              const place = intermediateAutocompleteRefs.current[index].getPlace();
              if (place && place.formatted_address) {
                handleIntermediatePointChange(index, place.formatted_address);
              }
            });
          }

          // Prevent form submission on enter
          inputRef.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
          });
        } catch (error) {
          console.error(`Error setting up intermediate autocomplete ${index}:`, error);
        }
      }
    });

    // Clean up function
    return () => {
      try {
        // Clean up all event listeners
        if (sourceAutocompleteRef.current) {
          clearInstanceListeners(sourceAutocompleteRef.current);
        }
        if (destAutocompleteRef.current) {
          clearInstanceListeners(destAutocompleteRef.current);
        }
        intermediateAutocompleteRefs.current.forEach((autocomplete) => {
          if (autocomplete) {
            clearInstanceListeners(autocomplete);
          }
        });
      } catch (error) {
        console.error('Error cleaning up autocomplete listeners:', error);
      }
    };
  }, [googleLoaded, intermediatePoints.length]);

  // Update refs array when intermediate points change
  useEffect(() => {
    intermediateInputRefs.current = intermediateInputRefs.current.slice(
      0,
      intermediatePoints.length
    );
    intermediateAutocompleteRefs.current = intermediateAutocompleteRefs.current.slice(
      0,
      intermediatePoints.length
    );
  }, [intermediatePoints]);

  const setIntermediateInputRef = (index: number) => (el: HTMLInputElement | null) => {
    intermediateInputRefs.current[index] = el;
  };

  const handleAddIntermediatePoint = () => {
    setIntermediatePoints([...intermediatePoints, '']);
  };

  const handleRemoveIntermediatePoint = (index: number) => {
    const newPoints = [...intermediatePoints];
    newPoints.splice(index, 1);
    setIntermediatePoints(newPoints);
  };

  const handleIntermediatePointChange = (index: number, value: string) => {
    const newPoints = [...intermediatePoints];
    newPoints[index] = value;
    setIntermediatePoints(newPoints);
  };

  const validateForm = (): boolean => {
    if (!source.trim()) {
      setFormError('Please enter a source location');
      return false;
    }

    if (!destination.trim()) {
      setFormError('Please enter a destination location');
      return false;
    }

    if (source.trim() === destination.trim()) {
      setFormError('Source and destination cannot be the same');
      return false;
    }

    // Check if any intermediate points are empty
    const emptyIntermediateIndex = intermediatePoints.findIndex((point) => !point.trim());
    if (emptyIntermediateIndex !== -1) {
      setFormError(`Please enter a location for intermediate point ${emptyIntermediateIndex + 1}`);
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onCalculateRoute(source, intermediatePoints, destination);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Route Optimization</h2>
            <p className="text-gray-600">
              Enter your delivery locations to find the optimal route.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Input */}
            <div className="space-y-2">
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Starting Point
              </label>
              <input
                ref={sourceInputRef}
                type="text"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter starting location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={!googleLoaded}
              />
            </div>

            {/* Intermediate Points */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Intermediate Stops
                </label>
                <button
                  type="button"
                  onClick={handleAddIntermediatePoint}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Stop
                </button>
              </div>

              {intermediatePoints.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    ref={setIntermediateInputRef(index)}
                    type="text"
                    value={point}
                    onChange={(e) => handleIntermediatePointChange(index, e.target.value)}
                    placeholder={`Stop ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    disabled={!googleLoaded}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIntermediatePoint(index)}
                    className="p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                ref={destInputRef}
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={!googleLoaded}
              />
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCalculating || !googleLoaded}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                isCalculating || !googleLoaded
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {isCalculating ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Calculating...
                </div>
              ) : (
                'Calculate Route'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;
