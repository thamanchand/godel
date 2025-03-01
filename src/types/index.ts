export interface Position {
  lat: number;
  lng: number;
}

export interface Stop {
  gtfsId: string;
  name: string;
  distance?: number;
  code: string;
  platformCode: string;
}

export interface Station {
  gtfsId: string;
  name: string;
  lat: number;
  lon: number;
  stops: Stop[];
}

export interface StopsByRadiusResponse {
  data: {
    stopsByRadius: {
      edges: {
        node: {
          stop: Stop;
          distance: number;
        };
      }[];
    };
  };
}
