/// <reference types="vite/client" />

// Define global window interface for Google Maps API
interface Window {
  google: {
    maps: {
      places: any;
      Geocoder: any;
      GeocoderStatus: { OK: string };
      DirectionsService: any;
      DirectionsStatus: { OK: string };
      TravelMode: { DRIVING: string };
      event: {
        clearInstanceListeners: (instance: any) => void;
      };
    };
  };
  initGooglePlacesAutocomplete: () => void;
}
