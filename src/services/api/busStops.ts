import { Position, Stop, StopsByRadiusResponse, Station } from '../../types/busStop';

import { fetchGraphQL } from './client';

export const getNearbyStops = async (position: Position): Promise<Stop[]> => {
  const query = `
    query GetNearbyStops($lat: Float!, $lon: Float!, $radius: Int!) {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
        edges {
          node {
            stop {
              gtfsId
              name
              code
              platformCode
              lat
              lon
              zoneId
            }
            distance
          }
        }
      }
    }
  `;

  const variables = {
    lat: position.latitude,
    lon: position.longitude,
    radius: 500,
  };

  try {
    const data = await fetchGraphQL<StopsByRadiusResponse>(query, variables);

    if (!data || !data.data || !data.data.stopsByRadius) {
      console.error('Invalid response structure:', data);
      return [];
    }

    return data.data.stopsByRadius.edges.map((edge) => ({
      ...edge.node.stop,
      distance: edge.node.distance,
    }));
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    return [];
  }
};

export const getStationsByName = async (name: string): Promise<Stop[]> => {
  const query = `
    query GetStationsByName($name: String!) {
      stations(name: $name) {
        gtfsId
        name
        lat
        lon
        stops {
          gtfsId
          name
          code
          platformCode
        }
      }
    }
  `;

  const variables = {
    name,
  };

  try {
    const response = await fetchGraphQL<{ data: { stations: Station[] } }>(query, variables);

    if (!response || !response.data || !response.data.stations) {
      console.error('Invalid response structure:', response);
      return [];
    }

    return response.data.stations.flatMap((station) => station.stops);
  } catch (error) {
    console.error('Error fetching stations by name:', error);
    return [];
  }
};
