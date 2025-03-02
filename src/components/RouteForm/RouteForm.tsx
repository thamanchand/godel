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
    <div className={styles.formContainer}>
      <div className={styles.form}>
        <div className={styles.logoContainer}>
          <img src="/logo.svg" alt="Logo" width={60} height={60} />
        </div>
        <h2 className={styles.brandName}>GodelAI</h2>

        {formError && <div className={styles.errorMessage}>{formError}</div>}

        <form onSubmit={handleSubmit}>
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
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
