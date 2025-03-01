import React, { useState, useEffect, useRef } from 'react';

import styles from './RouteForm.module.scss';

// Declare global google variable to fix TypeScript errors
declare global {
  interface Window {
    google: any;
  }
}

interface RouteFormProps {
  onCalculateRoute: (source: string, intermediatePoints: string[], destination: string) => void;
  isCalculating: boolean;
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

const RouteForm: React.FC<RouteFormProps> = ({ onCalculateRoute, isCalculating }) => {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [intermediatePoints, setIntermediatePoints] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState<boolean>(false);
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
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Places API is loaded and ready');
        setGoogleLoaded(true);
      } else {
        console.log('Google Places API not fully loaded yet');
      }
    };

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleLoaded(true);
      return;
    }

    // Listen for the custom event from index.html
    window.addEventListener('google-maps-loaded', initGooglePlaces);

    // Also set up a fallback timer in case the event doesn't fire
    const timer = setTimeout(() => {
      initGooglePlaces();
    }, 1000);

    // Clean up
    return () => {
      window.removeEventListener('google-maps-loaded', initGooglePlaces);
      clearTimeout(timer);
    };
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
        sourceAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          sourceInputRef.current,
          {
            componentRestrictions: { country: 'fi' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id'],
            types: ['geocode', 'establishment'],
          }
        );

        // Add place_changed listener
        sourceAutocompleteRef.current.addListener('place_changed', () => {
          const place = sourceAutocompleteRef.current.getPlace();
          if (place && place.formatted_address) {
            setSource(place.formatted_address);
          }
        });

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
        destAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          destInputRef.current,
          {
            componentRestrictions: { country: 'fi' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id'],
            types: ['geocode', 'establishment'],
          }
        );

        // Add place_changed listener
        destAutocompleteRef.current.addListener('place_changed', () => {
          const place = destAutocompleteRef.current.getPlace();
          if (place && place.formatted_address) {
            setDestination(place.formatted_address);
          }
        });

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
          intermediateAutocompleteRefs.current[index] = new window.google.maps.places.Autocomplete(
            inputRef,
            {
              componentRestrictions: { country: 'fi' },
              fields: ['formatted_address', 'geometry', 'name', 'place_id'],
              types: ['geocode', 'establishment'],
            }
          );

          // Add place_changed listener
          intermediateAutocompleteRefs.current[index].addListener('place_changed', () => {
            const place = intermediateAutocompleteRefs.current[index].getPlace();
            if (place && place.formatted_address) {
              handleIntermediatePointChange(index, place.formatted_address);
            }
          });

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
          window.google.maps.event.clearInstanceListeners(sourceAutocompleteRef.current);
        }
        if (destAutocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(destAutocompleteRef.current);
        }
        intermediateAutocompleteRefs.current.forEach((autocomplete) => {
          if (autocomplete) {
            window.google.maps.event.clearInstanceListeners(autocomplete);
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

    if (validateForm()) {
      onCalculateRoute(source, intermediatePoints, destination);
    }
  };

  const handleExampleClick = (
    location: string,
    type: 'source' | 'destination' | 'intermediate'
  ) => {
    if (type === 'source') {
      setSource(location);
    } else if (type === 'destination') {
      setDestination(location);
    } else {
      // For intermediate, replace the first empty one or add a new one
      const emptyIndex = intermediatePoints.findIndex((point) => point.trim() === '');
      if (emptyIndex >= 0) {
        handleIntermediatePointChange(emptyIndex, location);
      } else {
        setIntermediatePoints([...intermediatePoints, location]);
      }
    }
    setShowExamples(false);
  };

  const handleQuickRoute = () => {
    // Set a quick route between two random example locations
    const availableLocations = [...EXAMPLE_LOCATIONS];

    // Get random source
    const sourceIndex = Math.floor(Math.random() * availableLocations.length);
    const sourceLocation = availableLocations[sourceIndex];
    availableLocations.splice(sourceIndex, 1);

    // Get random destination
    const destIndex = Math.floor(Math.random() * availableLocations.length);
    const destLocation = availableLocations[destIndex];

    setSource(sourceLocation);
    setDestination(destLocation);
    setIntermediatePoints([]);
  };

  return (
    <div className={styles.routeForm}>
      <h2>Shortest Path Navigation</h2>

      {formError && <div className={styles.errorMessage}>{formError}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="source-input">Starting Point:</label>
          <input
            id="source-input"
            ref={sourceInputRef}
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Enter starting location"
            disabled={isCalculating}
          />
        </div>

        {intermediatePoints.map((point, index) => (
          <div key={index} className={styles.formGroup}>
            <label htmlFor={`intermediate-${index}`}>Via Point {index + 1}:</label>
            <div className={styles.inputWithButton}>
              <input
                id={`intermediate-${index}`}
                ref={setIntermediateInputRef(index)}
                type="text"
                value={point}
                onChange={(e) => handleIntermediatePointChange(index, e.target.value)}
                placeholder="Enter intermediate location"
                disabled={isCalculating}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveIntermediatePoint(index)}
                disabled={isCalculating}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className={styles.formGroup}>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddIntermediatePoint}
            disabled={isCalculating || intermediatePoints.length >= 5}
          >
            + Add Via Point
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="destination-input">Destination:</label>
          <input
            id="destination-input"
            ref={destInputRef}
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination location"
            disabled={isCalculating}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.calculateButton} disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Route'}
          </button>

          <button type="button" className={styles.quickRouteButton} onClick={handleQuickRoute}>
            Quick Demo Route
          </button>
        </div>

        <div className={styles.examplesSection}>
          <button
            type="button"
            className={styles.examplesToggle}
            onClick={() => setShowExamples(!showExamples)}
          >
            {showExamples ? 'Hide Examples' : 'Show Example Locations'}
          </button>

          {showExamples && (
            <div className={styles.examplesList}>
              <p className={styles.examplesHint}>
                For best results, include city or country names with locations
              </p>
              {EXAMPLE_LOCATIONS.map((location, index) => (
                <div key={index} className={styles.exampleItem}>
                  <span>{location}</span>
                  <div className={styles.exampleButtons}>
                    <button type="button" onClick={() => handleExampleClick(location, 'source')}>
                      Use as Source
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExampleClick(location, 'intermediate')}
                    >
                      Add as Stop
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExampleClick(location, 'destination')}
                    >
                      Use as Destination
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RouteForm;
