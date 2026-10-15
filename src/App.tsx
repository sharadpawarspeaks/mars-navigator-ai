import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import L, { type Map as LeafletMap, type LatLngExpression } from 'leaflet'
import {
  Activity,
  ArrowUpRight,
  Bot,
  ChevronDown,
  CircleHelp,
  Compass,
  FlaskConical,
  Gauge,
  MapPin,
  Menu,
  MessageSquare,
  Mountain,
  Navigation,
  Radio,
  RotateCcw,
  Satellite,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import './App.css'

type Point = { x: number; y: number }
type MissionPoint = Point & { name: string; detail: string; type: 'start' | 'destination' }
type Poi = Point & {
  name: string
  category: string
  detail: string
  source: string
  accent: 'cyan' | 'gold' | 'red'
}
type ChatMessage = { role: 'assistant' | 'user'; text: string }

const GRID_WIDTH = 24
const GRID_HEIGHT = 16
const DEFAULT_START: MissionPoint = { x: 3, y: 12, name: 'Ares Base Camp', detail: 'Jezero Crater rim', type: 'start' }
const DEFAULT_DESTINATION: MissionPoint = {
  x: 19,
  y: 4,
  name: 'Delta Fan Outcrop',
  detail: 'Jezero ancient river delta',
  type: 'destination',
}

const pois: Poi[] = [
  {
    x: 18,
    y: 5,
    name: 'Jezero Crater',
    category: 'Ancient lakebed',
    detail: 'A preserved delta system selected for its record of past aqueous activity.',
    source: 'NASA / JPL-Caltech',
    accent: 'gold',
  },
  {
    x: 8,
    y: 4,
    name: 'Mawrth Vallis',
    category: 'Clay mineral region',
    detail: 'Orbital spectroscopy indicates hydrated minerals exposed in layered terrain.',
    source: 'NASA / USGS Astrogeology',
    accent: 'cyan',
  },
  {
    x: 15,
    y: 13,
    name: 'Nili Fossae',
    category: 'Fractured terrain',
    detail: 'A scientifically important graben system with diverse crustal compositions.',
    source: 'NASA / ESA imagery',
    accent: 'red',
  },
]

const hazardZones = [
  { x: 10, y: 7, radius: 2.4, label: 'Dust pocket' },
  { x: 14, y: 10, radius: 2.1, label: 'Steep escarpment' },
  { x: 5, y: 6, radius: 1.5, label: 'Rough regolith' },
]

const objectiveOptions = ['Sample clay minerals', 'Image stratified delta', 'Calibrate weather station']

function key(point: Point) {
  return `${point.x},${point.y}`
}

function terrainCost(point: Point) {
  const hazard = hazardZones.find((zone) => Math.hypot(zone.x - point.x, zone.y - point.y) <= zone.radius)
  if (hazard) return 8
  const ridge = Math.sin(point.x * 0.7) + Math.cos(point.y * 0.55)
  return ridge > 1 ? 3 : ridge < -1 ? 4 : 1
}

function findRoute(start: Point, goal: Point) {
  const open = [{ point: start, score: 0 }]
  const cameFrom = new Map<string, Point>()
  const costSoFar = new Map<string, number>([[key(start), 0]])
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
  ]

  while (open.length) {
    open.sort((a, b) => a.score - b.score)
    const current = open.shift()!.point
    if (key(current) === key(goal)) break

    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y }
      if (next.x < 0 || next.x >= GRID_WIDTH || next.y < 0 || next.y >= GRID_HEIGHT) continue
      const nextCost = (costSoFar.get(key(current)) ?? 0) + terrainCost(next)
      if (nextCost < (costSoFar.get(key(next)) ?? Number.POSITIVE_INFINITY)) {
        costSoFar.set(key(next), nextCost)
        const heuristic = Math.abs(goal.x - next.x) + Math.abs(goal.y - next.y)
        open.push({ point: next, score: nextCost + heuristic })
        cameFrom.set(key(next), current)
      }
    }
  }

  const route: Point[] = []
  let cursor = goal
  while (key(cursor) !== key(start)) {
    route.unshift(cursor)
    const previous = cameFrom.get(key(cursor))
    if (!previous) return []
    cursor = previous
  }
  route.unshift(start)
  return route
}

function routeMetrics(route: Point[]) {
  const distance = route.reduce((total, point, index) => {
    if (!index) return 0
    const previous = route[index - 1]
    return total + Math.hypot(point.x - previous.x, point.y - previous.y) * 0.42
  }, 0)
  const averageDifficulty = route.reduce((sum, point) => sum + terrainCost(point), 0) / Math.max(route.length, 1)
  return {
    distance,
    duration: distance * 0.54 + averageDifficulty * 0.7,
    difficulty: averageDifficulty > 4 ? 'High' : averageDifficulty > 2.2 ? 'Moderate' : 'Low',
    score: Math.min(98, Math.round(100 - averageDifficulty * 8)),
  }
}

function pointToMap(point: Point): LatLngExpression {
  return [GRID_HEIGHT - point.y, point.x]
}

function App() {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const [start, setStart] = useState(DEFAULT_START)
  const [destination, setDestination] = useState(DEFAULT_DESTINATION)
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [objectives, setObjectives] = useState(['Sample clay minerals', 'Image stratified delta'])
  const [notes, setNotes] = useState('Prioritize the elevated western approach after sunrise thermal imaging.')
  const [assistantInput, setAssistantInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Welcome to Mars Navigator. I can explain the route model, compare candidate sites, or summarize what is verified versus simulated.',
    },
  ])
  const route = useMemo(() => findRoute(start, destination), [start, destination])
  const metrics = useMemo(() => routeMetrics(route), [route])

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return
    const map = L.map(mapElement.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 3,
      zoomControl: false,
      attributionControl: false,
    })
    map.fitBounds([
      [0, 0],
      [GRID_HEIGHT, GRID_WIDTH],
    ])
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    map.on('click', (event) => {
      const point = {
        x: Math.max(0, Math.min(GRID_WIDTH - 1, Math.round(event.latlng.lng))),
        y: Math.max(0, Math.min(GRID_HEIGHT - 1, Math.round(GRID_HEIGHT - event.latlng.lat))),
      }
      setDestination({ ...point, name: 'Selected waypoint', detail: 'Custom map selection', type: 'destination' })
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle || layer instanceof L.Rectangle) {
        map.removeLayer(layer)
      }
    })

    const routeLine = L.polyline(route.map(pointToMap), {
      color: '#f4b85f',
      weight: 4,
      opacity: 0.95,
      dashArray: '2 8',
      lineCap: 'round',
    })
    routeLine.addTo(map)
    L.marker(pointToMap(start), { icon: pinIcon('#70d6d0', 'BASE') }).bindTooltip(start.name).addTo(map)
    L.marker(pointToMap(destination), { icon: pinIcon('#f4b85f', 'GOAL') }).bindTooltip(destination.name).addTo(map)
    pois.forEach((poi) => {
      L.marker(pointToMap(poi), { icon: poiIcon(poi.accent) }).bindTooltip(poi.name).addTo(map)
    })
    hazardZones.forEach((zone) => {
      L.circle(pointToMap(zone), {
        radius: zone.radius,
        color: '#f2765f',
        fillColor: '#f2765f',
        fillOpacity: 0.12,
        weight: 1,
        dashArray: '4 6',
      }).bindTooltip(zone.label).addTo(map)
    })
  }, [destination, route, start])

  const sendAssistantMessage = () => {
    const trimmed = assistantInput.trim()
    if (!trimmed) return
    const response = trimmed.toLowerCase().includes('safe')
      ? 'No route is certified safe. This planner is a deterministic demonstration using simulated hazards and terrain costs; crews must validate every segment against current mission data.'
      : trimmed.toLowerCase().includes('nasa')
        ? 'Verified references in this demo are limited to public NASA, JPL-Caltech, USGS Astrogeology, and ESA descriptions shown beside each scientific point.'
        : `The current route covers ${metrics.distance.toFixed(1)} km in the model, with ${metrics.difficulty.toLowerCase()} terrain. Connect a server-side model to replace this demonstration response.`
    setMessages((current) => [...current, { role: 'user', text: trimmed }, { role: 'assistant', text: response }])
    setAssistantInput('')
  }

  const resetMission = () => {
    setStart(DEFAULT_START)
    setDestination(DEFAULT_DESTINATION)
    setObjectives(['Sample clay minerals', 'Image stratified delta'])
    setNotes('Prioritize the elevated western approach after sunrise thermal imaging.')
    setMessages([messages[0]])
  }

  const toggleObjective = (objective: string) => {
    setObjectives((current) => current.includes(objective) ? current.filter((item) => item !== objective) : [...current, objective])
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Satellite size={20} /></div>
          <div>
            <strong>MARS NAVIGATOR</strong>
            <span>MISSION CONTROL / 26</span>
          </div>
          <button className="icon-button mobile-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="mission-status">
          <div className="status-dot" />
          <div><span>MISSION STATUS</span><strong>SIMULATION READY</strong></div>
          <Radio size={16} />
        </div>
        <nav className="main-nav">
          <span className="nav-label">OPERATIONS</span>
          {[
            { id: 'overview', label: 'Mission overview', icon: Gauge },
            { id: 'map', label: 'Terrain navigator', icon: Compass },
            { id: 'planner', label: 'Mission planner', icon: Target },
            { id: 'science', label: 'Science registry', icon: FlaskConical },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activeTab === id ? 'nav-item-active' : ''}`} onClick={() => { setActiveTab(id); setIsMobileNavOpen(false) }}>
              <Icon size={17} /><span>{label}</span>{activeTab === id && <ArrowUpRight size={14} />}
            </button>
          ))}
          <span className="nav-label">INTELLIGENCE</span>
          <button className={`nav-item ${activeTab === 'assistant' ? 'nav-item-active' : ''}`} onClick={() => { setActiveTab('assistant'); setIsMobileNavOpen(false) }}>
            <Bot size={17} /><span>Mars assistant</span><span className="beta-badge">BETA</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="data-card">
            <div className="data-card-top"><span>DATA LINK</span><span className="live-label"><span className="status-dot" />LIVE</span></div>
            <strong>NASA PLANETARY DATA</strong>
            <p>Source status: public references loaded. Terrain is simulated.</p>
            <div className="signal"><span /><span /><span /><span /><span /><span /><span /></div>
          </div>
          <div className="profile-row"><div className="avatar">SP</div><div><strong>Science pilot</strong><span>Expedition 01</span></div><ChevronDown size={15} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setIsMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div><span className="eyebrow">SOL 184 · JEZERO CRATER REGION</span><h1>{activeTab === 'assistant' ? 'Mars assistant' : activeTab === 'science' ? 'Science registry' : 'Mission overview'}</h1></div>
          <div className="topbar-actions"><div className="orbit-indicator"><span className="orbit-dot" />ORBITAL LINK <strong>98%</strong></div><button className="icon-button"><CircleHelp size={18} /></button><button className="reset-button" onClick={resetMission}><RotateCcw size={14} /> Reset demo</button></div>
        </header>

        {activeTab === 'assistant' ? (
          <section className="assistant-view page-grid">
            <div className="panel assistant-panel">
              <div className="panel-heading"><div><span className="eyebrow">CONVERSATIONAL INTELLIGENCE</span><h2>Ask the mission specialist</h2></div><span className="source-pill"><Sparkles size={13} /> DEMO MODE</span></div>
              <p className="panel-copy">Responses below are local demonstrations. Configure a server-side AI provider before using this interface for operational decisions.</p>
              <div className="chat-window">
                {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}><div className="chat-avatar">{message.role === 'assistant' ? <Bot size={15} /> : 'SP'}</div><div><span>{message.role === 'assistant' ? 'MARS NAVIGATOR' : 'YOU'}</span><p>{message.text}</p></div></div>)}
              </div>
              <div className="chat-composer"><input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendAssistantMessage() }} placeholder="Ask about terrain, the route, or science..." /><button onClick={sendAssistantMessage} aria-label="Send message"><Send size={17} /></button></div>
            </div>
            <div className="panel prompt-panel"><div className="panel-heading"><h3>Suggested prompts</h3></div>{['What makes Jezero scientifically interesting?', 'Is this route safe for a rover?', 'Which hazards affect the eastern approach?'].map((prompt) => <button key={prompt} className="prompt-button" onClick={() => setAssistantInput(prompt)}>{prompt}<ArrowUpRight size={15} /></button>)}<div className="notice-box"><ShieldAlert size={17} /><p><strong>Operational boundary</strong>Never treat simulated terrain, hazard overlays, or assistant responses as a safety certification.</p></div></div>
          </section>
        ) : activeTab === 'science' ? (
          <section className="science-view">
            <div className="section-intro"><div><span className="eyebrow">REFERENCE CATALOGUE</span><h2>Scientific points of interest</h2><p>Publicly documented locations with source attribution. Coordinates in this visual are normalized for the mission demo.</p></div><span className="source-pill"><FlaskConical size={14} /> 03 REGISTERED SITES</span></div>
            <div className="science-grid">{pois.map((poi) => <article className="science-card" key={poi.name}><div className={`science-icon ${poi.accent}`}><MapPin size={20} /></div><div className="science-card-body"><div className="card-kicker">{poi.category}</div><h3>{poi.name}</h3><p>{poi.detail}</p><div className="science-source"><span>REFERENCE</span>{poi.source}</div></div><button className="card-arrow" onClick={() => { setDestination({ x: poi.x, y: poi.y, name: poi.name, detail: poi.category, type: 'destination' }); setActiveTab('map') }}><ArrowUpRight size={17} /></button></article>)}</div>
            <div className="panel attribution-panel"><ShieldAlert size={17} /><div><strong>Data boundary</strong><p>Site descriptions are based on public NASA, JPL-Caltech, USGS Astrogeology, and ESA materials. Hazard zones, route costs, travel time, and mission recommendations in this demo are simulated.</p></div></div>
          </section>
        ) : (
          <>
            <section className="metrics-row">
              <MetricCard icon={<Navigation size={17} />} label="SELECTED DESTINATION" value={destination.name} detail={destination.detail} accent="gold" />
              <MetricCard icon={<MapPin size={17} />} label="ROUTE DISTANCE" value={`${metrics.distance.toFixed(1)} km`} detail="A* terrain-aware estimate" accent="cyan" />
              <MetricCard icon={<Activity size={17} />} label="ESTIMATED TRANSIT" value={`${metrics.duration.toFixed(1)} h`} detail="At 0.78 km/h model pace" accent="purple" />
              <MetricCard icon={<Mountain size={17} />} label="TERRAIN DIFFICULTY" value={metrics.difficulty} detail={`${metrics.score}% route confidence`} accent="red" />
            </section>
            <section className="workspace-grid">
              <div className="panel map-panel" id="map-panel">
                <div className="panel-heading map-heading"><div><span className="eyebrow">LIVE TERRAIN SIMULATION</span><h2>Mars surface navigator</h2></div><div className="map-tools"><span className="map-live"><span className="status-dot" />MAP LINK</span><button className="icon-button"><Menu size={16} /></button></div></div>
                <div className="map-frame"><div className="map-overlay-label top-left"><span>18.43°N</span><span>77.51°E</span></div><div className="map-overlay-label bottom-right"><span>GRID: JEZERO-04</span><span>RES: DEMO 420M</span></div><div ref={mapElement} className="leaflet-map" /><div className="map-legend"><span><i className="legend-line" />PLANNED ROUTE</span><span><i className="legend-dot cyan" />SCIENCE SITE</span><span><i className="legend-ring" />HAZARD ZONE</span></div></div>
                <div className="map-footer"><span><span className="status-dot" /> External planetary tiles optional</span><span>Click map to set destination</span><span className="footer-source">Fallback terrain visualization active</span></div>
              </div>
              <div className="side-stack">
                <div className="panel route-panel"><div className="panel-heading"><div><span className="eyebrow">ROUTE INTELLIGENCE</span><h3>Path assessment</h3></div><span className="score-badge">{metrics.score}<small>/100</small></span></div><div className="route-summary"><div><span>START</span><strong>{start.name}</strong></div><ArrowUpRight size={18} /><div><span>DESTINATION</span><strong>{destination.name}</strong></div></div><div className="difficulty-bar"><div><span>Terrain load</span><strong>{metrics.difficulty}</strong></div><div className="bar-track"><span style={{ width: `${100 - metrics.score + 18}%` }} /></div></div><div className="warning-line"><ShieldAlert size={16} /><span>Route intersects 2 modeled hazard buffers. Review before deployment.</span></div><button className="secondary-button" onClick={() => setActiveTab('planner')}>Open mission planner <ArrowUpRight size={15} /></button></div>
                <div className="panel telemetry-panel"><div className="panel-heading"><h3>Environmental telemetry</h3><span className="mini-live">LIVE</span></div><Telemetry label="Surface pressure" value="6.4" unit="mbar" width="34%" /><Telemetry label="Wind velocity" value="18" unit="km/h" width="58%" /><Telemetry label="Visibility" value="82" unit="%" width="82%" /><Telemetry label="Solar energy" value="74" unit="%" width="74%" /></div>
              </div>
            </section>
            <section className="bottom-grid">
              <div className="panel objectives-panel"><div className="panel-heading"><div><span className="eyebrow">MISSION OBJECTIVES</span><h3>Science package</h3></div><span className="completion">{objectives.length}/3 COMPLETE</span></div><div className="objective-list">{objectiveOptions.map((objective) => <label className="objective-row" key={objective}><input type="checkbox" checked={objectives.includes(objective)} onChange={() => toggleObjective(objective)} /><span className="checkmark" /><span>{objective}</span></label>)}</div></div>
              <div className="panel note-panel"><div className="panel-heading"><div><span className="eyebrow">MISSION LOG</span><h3>Field notes</h3></div><MessageSquare size={16} /></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /><div className="note-footer"><span>Autosaved locally</span><button onClick={() => setActiveTab('planner')}>Review mission <ArrowUpRight size={14} /></button></div></div>
              <div className="panel source-panel"><div className="panel-heading"><div><span className="eyebrow">SOURCE STATUS</span><h3>Evidence ledger</h3></div><ShieldAlert size={16} /></div><div className="source-row"><span className="source-dot verified" /><div><strong>Scientific locations</strong><span>Public references attached</span></div><span className="verified-label">VERIFIED</span></div><div className="source-row"><span className="source-dot simulated" /><div><strong>Terrain + hazards</strong><span>Deterministic demo model</span></div><span className="simulated-label">SIMULATED</span></div></div>
            </section>
          </>
        )}

        {activeTab === 'planner' && <div className="planner-drawer"><div className="panel-heading"><div><span className="eyebrow">MISSION CONFIGURATION</span><h2>Plan the expedition</h2></div><button className="icon-button" onClick={() => setActiveTab('overview')}><X size={18} /></button></div><div className="planner-grid"><div><label className="field-label">STARTING LOCATION</label><button className="select-field" onClick={() => setStart(start.name === DEFAULT_START.name ? { x: 4, y: 10, name: 'Western landing zone', detail: 'Jezero rim approach', type: 'start' } : DEFAULT_START)}>{start.name}<ChevronDown size={16} /></button></div><div><label className="field-label">DESTINATION</label><button className="select-field" onClick={() => setDestination(destination.name === DEFAULT_DESTINATION.name ? { x: 8, y: 4, name: 'Mawrth Vallis', detail: 'Clay mineral region', type: 'destination' } : DEFAULT_DESTINATION)}>{destination.name}<ChevronDown size={16} /></button></div></div><div className="planner-route-preview"><div className="preview-stat"><span>ROUTE</span><strong>{metrics.distance.toFixed(1)} km</strong></div><div className="preview-stat"><span>TRANSIT</span><strong>{metrics.duration.toFixed(1)} h</strong></div><div className="preview-stat"><span>DIFFICULTY</span><strong>{metrics.difficulty}</strong></div><button className="primary-button" onClick={() => setActiveTab('map')}>View route on map <ArrowUpRight size={15} /></button></div></div>}
      </main>
    </div>
  )
}

function MetricCard({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string; detail: string; accent: string }) {
  return <div className={`metric-card ${accent}`}><div className="metric-icon">{icon}</div><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-detail">{detail}</span></div>
}

function Telemetry({ label, value, unit, width }: { label: string; value: string; unit: string; width: string }) {
  return <div className="telemetry-row"><div><span>{label}</span><strong>{value}<small>{unit}</small></strong></div><div className="telemetry-bar"><span style={{ width }} /></div></div>
}

function pinIcon(color: string, label: string) {
  return L.divIcon({ className: 'custom-pin', html: `<span style="--pin-color:${color}"><b>${label}</b></span>`, iconSize: [52, 28], iconAnchor: [26, 14] })
}

function poiIcon(accent: Poi['accent']) {
  const colors = { cyan: '#70d6d0', gold: '#f4b85f', red: '#f2765f' }
  return L.divIcon({ className: 'poi-pin', html: `<span style="--pin-color:${colors[accent]}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] })
}

export default App
