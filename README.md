# Mars Navigator AI

Mars Navigator AI is a NASA Space Apps Challenge 2026 demonstration interface for exploring Martian terrain, planning rover routes, reviewing scientific locations, and separating public reference data from simulated mission intelligence.

## What is included

- **Mission dashboard** with destination, distance, transit, terrain, objective, telemetry, and source-status cards.
- **Interactive Mars navigator** built with Leaflet's `CRS.Simple`. Click the map to choose a destination, inspect POIs, review hazard buffers, and follow the A* route overlay.
- **A* route planner** running locally on a deterministic terrain grid. Distance, travel time, difficulty, and route confidence are estimates for demonstration only.
- **Mission planner** for changing the start/destination pair, selecting science objectives, editing field notes, and resetting the sample mission.
- **Science registry** with public-source attribution for Jezero Crater, Mawrth Vallis, and Nili Fossae.
- **Mars assistant demo** with local responses and explicit guidance for connecting a secure server-side model.
- **Responsive mission-control UI** with a dark space theme, Mars-red accents, mobile navigation, responsive panels, loading-safe local state, and accessible controls.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite. For a production build:

```bash
npm run build
npm run preview
```

`npm run lint` runs the repository's Oxlint configuration.

## Data and integration boundaries

The current demo intentionally distinguishes evidence from simulation:

- Scientific location descriptions and source labels are based on public material from **NASA**, **JPL-Caltech**, **USGS Astrogeology**, and **ESA**.
- Terrain costs, hazard buffers, route confidence, route safety language, normalized coordinates, transit time, and environmental telemetry are **simulated deterministic demo data**.
- No route is certified safe. The UI warns users whenever simulated information is used.
- The map is a Leaflet planetary-style coordinate canvas with an offline-safe simulated surface. A verified planetary tile service can be added as an optional `L.TileLayer` without changing the route model; the interface must continue to work when remote tiles are unavailable.
- No NASA API key or AI key is bundled in the frontend. Add any future credentials to a server-side integration (or a secure proxy), never to `VITE_*` client variables.

## Suggested production integration path

1. Add a small server-side adapter for NASA/USGS planetary products and cache source metadata.
2. Serve verified Mars basemaps or raster tiles through that adapter, with attribution and a clear offline fallback.
3. Validate terrain and hazard layers against mission-specific rover constraints before exposing them to operators.
4. Add a server-side AI endpoint that applies source retrieval, rate limits, logging, and safety disclaimers before returning assistant responses.

## Project structure

```text
src/
  App.tsx       Mission dashboard, map, planner, science registry, and assistant demo
  App.css       Responsive mission-control visual system
  index.css     Global reset and Tailwind entrypoint
```
