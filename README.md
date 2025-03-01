# HSL Nearby Bus Stops Finder

This project leverages the HSL API to retrieve bus stops based on a specified location, assisting users in finding nearby HSL bus stops in Helsinki, Vantaa, and Espoo. It is developed using React, TypeScript, Graphql and Leaflet map.

### Live Demo

The application is deployed at: [HSL Bus Stop Finder](https://hsl-bus-stops.vercel.app)

### Screenshots

![HSL Bus Stop Finder](./public/screenshot.png)

## Features

- Interactive map to find bus stops
- Real-time location-based search
- Distance-based filtering
- Sort bus stop from closest to farthest
- Reverse geocoding for address lookup

## Tech Stack

- React 19
- TypeScript
- GraphQL
- Vite
- Leaflet/React-Leaflet
- SASS Modules
- Vitest for testing
- ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/thamanchand/hsl-api-task.git
cd hsl-api-task
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory and add your HSL API key:

```bash
VITE_HSL_API_KEY=your_api_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

### Testing

Run tests:

```bash
npm run test
```

### Building

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
├── components/
├── hooks/
├── services/
├── styles/
├── types/
└── utils/
```

### Repository

GitHub Repository: [github.com/thamanchand/hsl-api-task](https://github.com/thamanchand/hsl-api-task)

### Approach & Implementation

- Familiarized with the HSL Open API.
- Utilized the GraphQL playground to test APIs.
- Developed a use case to address the challenges.
- Initialized the project and began building the bus stop listing and map components.
- Integrated services and connected GraphQL to fetch real data and map it to components.
- Created custom hooks for reusable logic.
- Defined global styles, variables, and mixins.
- Implemented sorting and filtering functionalities.
- Applied styles to map components.
- Wrote comprehensive tests.
- Documented the development process and features.
- Established a CI/CD deployment pipeline and testing on GitHub.

### Challenges Faced

**HSL API Complexity**:

- HSL provides a variety of APIs, including the Journey Planner, Map API, Real-time API, GTFS-RT, Beacon, and others.
- The initial challenge was to identify a suitable use case to effectively utilize the API, which required thoroughly reviewing the documentation.

### Overcome the challenges

- I overcame these challenges by thoroughly reviewing the documentation, gaining a deep understanding of the API, and utilizing the GraphQL playground provided by HSL for testing.
- Having previously worked on map-related features in several projects, I found it straightforward to develop a unique drag-and-drop feature for locating nearby bus stops.

### Potential Improvements

- Add real-time bus arrival information on stops
- Better state management and caching of the data
- Add route visualization on map
- Add end-to-end testing using cypress
- Add more filtering options (e.g: zone)
- Improve mobile experience

## License

MIT
