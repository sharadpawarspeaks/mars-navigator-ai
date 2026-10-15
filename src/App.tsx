import { useMemo, useState } from 'react'
import { AIAssistantPanel } from './components/AIAssistantPanel'
import { MarsMap } from './components/MarsMap'
import { MissionPlanner } from './components/MissionPlanner'
import {
  blockedCells,
  demoTerrainGrid,
  estimatedMetersPerMinute,
  hazardZones,
  landingSites,
  metersPerGridStep,
  scientificPoints,
} from './data/marsDemoData'
import { findAStarRoute } from './lib/pathfinding'

type SelectionMode = 'start' | 'destination'

const navSections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'map', label: 'Mars map' },
  { id: 'mission-planner', label: 'Mission planner' },
  { id: 'ai-assistant', label: 'AI assistant' },
  { id: 'nasa-data', label: 'NASA sources' },
]

const defaultStartId = landingSites[0].id
const defaultDestinationId = landingSites[landingSites.length - 1].id

function App() {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('start')
  const [startSiteId, setStartSiteId] = useState<string>(defaultStartId)
  const [destinationSiteId, setDestinationSiteId] = useState<string>(defaultDestinationId)

  const startSite = landingSites.find((site) => site.id === startSiteId)
  const destinationSite = landingSites.find((site) => site.id === destinationSiteId)

  const route = useMemo(() => {
    if (!startSite || !destinationSite) {
      return null
    }

    return findAStarRoute(demoTerrainGrid, blockedCells, startSite.grid, destinationSite.grid)
  }, [destinationSite, startSite])

  const routeDistanceMeters = route ? Math.max(route.path.length - 1, 0) * metersPerGridStep : 0
  const difficultyFactor = route ? 1 + route.averageDifficulty / 12 : 1
  const travelMinutes = route ? (routeDistanceMeters / estimatedMetersPerMinute) * difficultyFactor : 0

  const missionStatus = route
    ? 'Route ready for mission review'
    : 'No route found with current demonstration hazards'

  const onSelectSite = (siteId: string) => {
    if (selectionMode === 'start') {
      setStartSiteId(siteId)
      return
    }
    setDestinationSiteId(siteId)
  }

  const missionStats = [
    { label: 'Selected route distance', value: `${routeDistanceMeters.toFixed(0)} m` },
    { label: 'Estimated traverse time', value: `${travelMinutes.toFixed(1)} min` },
    {
      label: 'Terrain difficulty score',
      value: route ? `${route.averageDifficulty.toFixed(2)} / 10` : 'N/A',
    },
    { label: 'Planning status', value: missionStatus },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[250px,1fr] lg:p-6">
        <aside className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">Mars Navigator AI</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Mission Control</h1>
          <p className="mt-2 text-sm text-slate-300">NASA Space Apps Challenge 2026 prototype for expedition planning.</p>

          <nav className="mt-6 space-y-2 text-sm">
            {navSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-slate-300 transition hover:bg-red-500/20 hover:text-red-100"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
            Safety disclaimer: route outputs are illustrative and must be validated with mission-grade terrain and hazard data.
          </div>
        </aside>

        <main className="space-y-6">
          <section id="dashboard" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-red-300">Mars exploration dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Plan exploration routes across demonstrative Martian terrain</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">
              This build combines route planning, mission preparation, and science-point context. NASA-verified sources are linked
              where available, and all generated terrain metrics are marked as demonstration estimates.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {missionStats.map((stat) => (
                <article key={stat.label} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{stat.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="map" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">Interactive Mars map</h2>
                <p className="text-sm text-slate-300">Select map markers as a start or destination, then inspect the proposed A* route.</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-2 text-xs">
                <span className="mr-2 text-slate-300">Selection mode:</span>
                <button
                  type="button"
                  onClick={() => setSelectionMode('start')}
                  className={`rounded-md px-3 py-1 ${selectionMode === 'start' ? 'bg-green-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('destination')}
                  className={`ml-2 rounded-md px-3 py-1 ${selectionMode === 'destination' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                  Destination
                </button>
              </div>
            </div>

            <MarsMap
              sites={landingSites}
              points={scientificPoints}
              hazards={hazardZones}
              selectionMode={selectionMode}
              startSiteId={startSiteId}
              destinationSiteId={destinationSiteId}
              routePath={route?.path ?? []}
              onSelectSite={onSelectSite}
            />

            {!route && (
              <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                No route is currently available. Select a different start/destination pair outside blocked hazard cells.
              </div>
            )}
          </section>

          <MissionPlanner
            start={startSite?.name ?? 'Not selected'}
            destination={destinationSite?.name ?? 'Not selected'}
            distanceMeters={routeDistanceMeters}
            travelMinutes={travelMinutes}
            averageDifficulty={route?.averageDifficulty ?? 0}
          />

          <section id="terrain-analysis" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-2xl font-semibold text-white">Terrain and hazard analysis</h2>
            <p className="mt-2 text-sm text-slate-300">
              Hazard zones and terrain costs shown below are illustrative overlays used to test mission workflows.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {hazardZones.map((hazard) => (
                <li key={hazard.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <p className="font-medium text-red-200">{hazard.name}</p>
                  <p>{hazard.note}</p>
                  <p className="mt-1 text-xs text-orange-300">{hazard.label} — do not treat route as safety-approved.</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="science" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-2xl font-semibold text-white">Scientific exploration points</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {scientificPoints.map((point) => (
                <article key={point.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <p className="text-sm font-semibold text-slate-100">{point.name}</p>
                  <p className="mt-1 text-sm text-slate-300">{point.summary}</p>
                  <p className="mt-2 text-xs text-slate-400">Data label: {point.dataLabel}</p>
                  <a href={point.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-blue-300 underline">
                    {point.source}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <AIAssistantPanel />

          <section id="nasa-data" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-2xl font-semibold text-white">NASA data sources</h2>
            <p className="mt-2 text-sm text-slate-300">Use these official platforms for validated planetary datasets and mapping layers.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                <a className="text-red-200 underline" href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">
                  NASA Mars Trek
                </a>
                <p className="text-slate-300">Interactive map layers and mission planning context for Mars terrains.</p>
              </li>
              <li className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                <a className="text-red-200 underline" href="https://pds.nasa.gov/" target="_blank" rel="noreferrer">
                  NASA Planetary Data System (PDS)
                </a>
                <p className="text-slate-300">Authoritative archive for planetary science data and metadata.</p>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
