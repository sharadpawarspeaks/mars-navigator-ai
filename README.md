# Mars Navigator AI

Mars Navigator AI is a professional web application concept for the **NASA Space Apps Challenge 2026**. It provides an interactive mission-control style interface for Mars exploration and demonstrative route planning.

## What this prototype includes

- Dark-themed Mars exploration dashboard with responsive navigation
- Interactive Leaflet-based map with selectable start/destination markers
- Demonstration **A\*** route planning across a labeled terrain grid
- Route summaries (distance, estimated travel duration, terrain difficulty)
- Terrain hazard overlays labeled as illustrative (not safety-certified)
- Scientific points of interest with source links where verified data exists
- Mission planner panel with objectives and notes
- AI assistant panel with explicit setup messaging when backend AI is not configured
- Dedicated links to NASA Mars Trek and NASA PDS

## Data transparency

- NASA-verified references are marked in the UI where available.
- Terrain grid values, hazard overlays, and route estimates are demonstration data for prototyping.
- Route outputs are illustrative and must be validated with mission-grade terrain and hazard data before operational use.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS (via `@tailwindcss/vite`)
- Leaflet + React Leaflet

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build and quality checks

```bash
npm run lint
npm run build
```

## Optional AI assistant backend configuration

The assistant UI expects a backend endpoint URL in local development:

```bash
VITE_MARS_ASSISTANT_API_URL=http://localhost:8000/api/assistant
```

Add this to a local `.env` file. The frontend intentionally does not fake live AI responses when this is missing.
