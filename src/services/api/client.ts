import { API_URL } from '../../constants';

export const HSL_API_KEY = import.meta.env.VITE_HSL_API_KEY;

if (!HSL_API_KEY) {
  throw new Error(
    'HSL API Key is missing. Please add VITE_HSL_API_KEY to your .env file. See README.md for setup instructions.'
  );
}

export const fetchGraphQL = async <T>(query: string, variables = {}): Promise<T> => {
  const response = await fetch(`${API_URL}?digitransit-subscription-key=${HSL_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
