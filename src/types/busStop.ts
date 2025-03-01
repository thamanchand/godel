export type Position = {
  latitude: number;
  longitude: number;
};

export interface Stop {
  gtfsId: string;
  name: string;
  code: string;
  platformCode?: string;
  zoneId?: string;
  distance?: number;
  lat?: number;
  lon?: number;
}

export type StopsByRadiusResponse = {
  data: {
    stopsByRadius: {
      edges: {
        node: {
          stop: {
            gtfsId: string;
            name: string;
            code: string;
            platformCode: string;
            zoneId: string;
            lat: number;
            lon: number;
          };
          distance: number;
        };
      }[];
    };
  };
};

export type Station = {
  gtfsId: string;
  name: string;
  lat: number;
  lon: number;
  stops: {
    gtfsId: string;
    name: string;
    code: string;
    platformCode?: string;
    zoneId?: string;
  }[];
};

export type StationsByNameResponse = {
  data: {
    stations: Station[];
  };
};
