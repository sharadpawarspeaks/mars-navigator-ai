import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { GridCoord, HazardZone, ScientificPoint, Site } from '../data/marsDemoData'

type SelectionMode = 'start' | 'destination'

type MarsMapProps = {
  sites: Site[]
  points: ScientificPoint[]
  hazards: HazardZone[]
  selectionMode: SelectionMode
  startSiteId: string | null
  destinationSiteId: string | null
  routePath: GridCoord[]
  onSelectSite: (siteId: string) => void
}

const startIcon = divIcon({
  className: '',
  html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#22c55e;border:2px solid #14532d;"></span>',
  iconSize: [12, 12],
})

const destinationIcon = divIcon({
  className: '',
  html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#ef4444;border:2px solid #7f1d1d;"></span>',
  iconSize: [12, 12],
})

const buildRouteCoordinates = (sites: Site[], routePath: GridCoord[]): [number, number][] => {
  if (routePath.length === 0) {
    return []
  }

  const byGrid = new Map<string, Site>()
  for (const site of sites) {
    byGrid.set(`${site.grid.x},${site.grid.y}`, site)
  }

  return routePath.map((gridPoint) => {
    const matchingSite = byGrid.get(`${gridPoint.x},${gridPoint.y}`)
    if (matchingSite) {
      return matchingSite.coordinates
    }

    return [18.42 + gridPoint.y * 0.015, 77.42 + gridPoint.x * 0.02]
  })
}

export function MarsMap({
  sites,
  points,
  hazards,
  selectionMode,
  startSiteId,
  destinationSiteId,
  routePath,
  onSelectSite,
}: MarsMapProps) {
  const routeCoordinates = buildRouteCoordinates(sites, routePath)

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
        <p className="text-sm font-medium text-red-300">Map data labeling</p>
        <p className="text-xs text-slate-300">
          Terrain grid, hazard overlays, and route estimates in this view are demonstration values for NASA Space Apps prototyping.
        </p>
      </div>
      <MapContainer
        center={[18.47, 77.54]}
        zoom={11}
        scrollWheelZoom
        className="h-[420px] w-full rounded-2xl border border-slate-700"
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hazards.map((hazard) => (
          <Circle
            key={hazard.id}
            center={hazard.center}
            radius={hazard.radiusMeters}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.15 }}
          >
            <Popup>
              <p className="font-semibold">{hazard.name}</p>
              <p className="text-sm">{hazard.note}</p>
              <p className="text-xs text-orange-700">{hazard.label}</p>
            </Popup>
          </Circle>
        ))}

        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={point.coordinates}
            radius={6}
            pathOptions={{ color: point.dataLabel === 'NASA verified' ? '#38bdf8' : '#facc15' }}
          >
            <Popup>
              <p className="font-semibold">{point.name}</p>
              <p className="text-sm">{point.summary}</p>
              <a
                href={point.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-700 underline"
              >
                Source: {point.source}
              </a>
            </Popup>
          </CircleMarker>
        ))}

        {sites.map((site) => {
          const isStart = site.id === startSiteId
          const isDestination = site.id === destinationSiteId
          return (
            <CircleMarker
              key={site.id}
              center={site.coordinates}
              radius={10}
              pathOptions={{
                color: isStart ? '#22c55e' : isDestination ? '#ef4444' : '#f87171',
                fillColor: '#111827',
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => onSelectSite(site.id),
              }}
            >
              <Popup>
                <p className="font-semibold">{site.name}</p>
                <p className="text-sm">{site.detail}</p>
                <p className="text-xs text-slate-500">
                  Click marker to set as {selectionMode === 'start' ? 'start point' : 'destination'}.
                </p>
              </Popup>
            </CircleMarker>
          )
        })}

        {startSiteId && (
          <Marker
            position={sites.find((site) => site.id === startSiteId)?.coordinates ?? [18.47, 77.54]}
            icon={startIcon}
          />
        )}
        {destinationSiteId && (
          <Marker
            position={sites.find((site) => site.id === destinationSiteId)?.coordinates ?? [18.47, 77.54]}
            icon={destinationIcon}
          />
        )}

        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} pathOptions={{ color: '#fb7185', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  )
}
