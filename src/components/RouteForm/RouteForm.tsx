import React, { useState, useEffect, useRef } from 'react';

import {
  isGoogleMapsLoaded,
  createAutocomplete,
  clearInstanceListeners,
  initGoogleMapsListener,
} from '../../services/googleMapsService';

import styles from './RouteForm.module.scss';

interface RouteFormProps {
  onCalculateRoute: (source: string, intermediatePoints: string[], destination: string) => void;
  isCalculating: boolean;
  route?: any; // Add route prop
}

// Example locations to help users get started - using real locations for better results
const EXAMPLE_LOCATIONS = [
  'Helsinki Central Station, Finland',
  'Helsinki Airport, Finland',
  'Kamppi Center, Helsinki',
  'University of Helsinki',
  'Olympic Stadium, Helsinki',
  'Suomenlinna, Helsinki',
  'Seurasaari, Helsinki',
  'Linnanmäki Amusement Park, Helsinki',
];

const RouteForm: React.FC<RouteFormProps> = ({ onCalculateRoute, isCalculating, route }) => {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [intermediatePoints, setIntermediatePoints] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState<boolean>(false);
  const [_formError, setFormError] = useState<string | null>(null); // Prefix with _ to indicate it's intentionally unused
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

  const handleUseExample = (location: string, type: 'source' | 'destination' | 'intermediate') => {
    if (type === 'source') {
      setSource(location);
    } else if (type === 'destination') {
      setDestination(location);
    } else {
      // Add as intermediate point
      setIntermediatePoints([...intermediatePoints, location]);
    }
  };

  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>Plan Your Route</h3>

        <div className={styles.optimizationNote}>
          Your route will be optimized from the starting point through all intermediate points to
          the destination, regardless of the order you enter them. This ensures the most efficient
          path.
        </div>

        {_formError && <div className={styles.errorMessage}>{_formError}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="source">Starting Point</label>
          <input
            id="source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Enter starting location"
            ref={sourceInputRef}
            disabled={isCalculating}
          />
        </div>

        {intermediatePoints.map((point, index) => (
          <div className={styles.inputGroup} key={`intermediate-${index}`}>
            <label htmlFor={`intermediate-${index}`}>Intermediate Point {index + 1}</label>
            <div className={styles.inputWithButton}>
              <input
                id={`intermediate-${index}`}
                type="text"
                value={point}
                onChange={(e) => handleIntermediatePointChange(index, e.target.value)}
                placeholder="Enter intermediate location"
                ref={setIntermediateInputRef(index)}
                disabled={isCalculating}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveIntermediatePoint(index)}
                disabled={isCalculating}
                aria-label="Remove intermediate point"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddIntermediatePoint}
          disabled={isCalculating || intermediatePoints.length >= 5}
        >
          Add Intermediate Point
        </button>

        <div className={styles.inputGroup}>
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            ref={destInputRef}
            disabled={isCalculating}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.calculateButton} disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Route'}
          </button>
        </div>

        <div className={styles.examplesSection}>
          {showExamples && (
            <div className={styles.examplesList}>
              <p className={styles.examplesHint}>
                Click on a location to use it in your route planning
              </p>

              <div className={styles.exampleItem}>
                <span>Popular Locations</span>
                <div className={styles.exampleButtons}>
                  {EXAMPLE_LOCATIONS.map((location, index) => (
                    <button
                      key={`example-${index}`}
                      type="button"
                      onClick={() => {
                        if (!source) handleUseExample(location, 'source');
                        else if (!destination) handleUseExample(location, 'destination');
                        else handleUseExample(location, 'intermediate');
                      }}
                    >
                      {location.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Route Results Section */}
      {route && (
        <div className={styles.routeResults}>
          <h4 className={styles.routeResultsTitle}>Route Details</h4>
          <div className={styles.routeResultsList}>
            {route.totalDistance && route.totalDuration ? (
              <div className={styles.routeSummary}>
                <div className={styles.routeDetail}>
                  <span className={styles.routeDetailLabel}>Total Distance:</span>
                  <span className={styles.routeDetailValue}>
                    {formatDistance(route.totalDistance)}
                  </span>
                </div>
                <div className={styles.routeDetail}>
                  <span className={styles.routeDetailLabel}>Estimated Time:</span>
                  <span className={styles.routeDetailValue}>
                    {formatDuration(route.totalDuration)}
                  </span>
                </div>
                {route.points && route.points.length > 0 && (
                  <div className={styles.routePoints}>
                    <div className={styles.routePointsTitle}>Route Points:</div>
                    <ol className={styles.routePointsList}>
                      {route.points.map((point: any, index: number) => (
                        <li key={`point-${index}`} className={styles.routePoint}>
                          {point.name || `Point ${index + 1}`}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noResults}>
                {isCalculating ? 'Calculating route...' : 'No route information available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteForm;
