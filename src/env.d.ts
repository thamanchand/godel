/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_HSL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
    };
  };
  initGooglePlacesAutocomplete: () => void;
}
