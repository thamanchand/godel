// Type definitions for Google Maps JavaScript API
// This file provides TypeScript type definitions for the Google Maps API

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            inputElement: HTMLInputElement,
            options?: {
              componentRestrictions?: { country: string };
              fields?: string[];
              types?: string[];
            }
          ) => any;
        };
        Geocoder: new () => any;
        GeocoderStatus: {
          OK: string;
        };
        DirectionsService: new () => any;
        DirectionsStatus: {
          OK: string;
        };
        TravelMode: {
          DRIVING: string;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
          addListener: (instance: any, eventName: string, handler: Function) => void;
          removeListener: (instance: any, eventName: string, handler: Function) => void;
        };
      };
    };
  }
}

// Also declare setTimeout and clearTimeout for completeness
declare function setTimeout(callback: Function, ms: number): number;
declare function clearTimeout(id: number): void;

export {};
