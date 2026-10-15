export type GridCoord = {
  x: number
  y: number
}

export type Site = {
  id: string
  name: string
  coordinates: [number, number]
  grid: GridCoord
  detail: string
  dataLabel: 'NASA verified' | 'Demonstration'
}

export type HazardZone = {
  id: string
  name: string
  center: [number, number]
  radiusMeters: number
  note: string
  label: 'Illustrative hazard'
}

export type ScientificPoint = {
  id: string
  name: string
  coordinates: [number, number]
  summary: string
  source: string
  sourceUrl: string
  dataLabel: 'NASA verified' | 'Demonstration'
}

export const demoTerrainGrid = [
  [1, 2, 2, 3, 4, 4, 5, 6],
  [1, 1, 2, 3, 3, 4, 5, 6],
  [2, 2, 2, 3, 4, 4, 5, 7],
  [2, 3, 3, 4, 5, 5, 6, 7],
  [2, 3, 4, 4, 6, 7, 7, 8],
  [3, 3, 4, 5, 6, 7, 8, 8],
  [3, 4, 5, 6, 7, 8, 8, 9],
  [4, 5, 6, 7, 8, 9, 9, 9],
]

export const blockedCells: GridCoord[] = [
  { x: 4, y: 4 },
  { x: 5, y: 4 },
]

export const landingSites: Site[] = [
  {
    id: 'jezero-base',
    name: 'Jezero Forward Base',
    coordinates: [18.44, 77.45],
    grid: { x: 0, y: 1 },
    detail: 'Operational starting point used for demonstration planning sessions.',
    dataLabel: 'Demonstration',
  },
  {
    id: 'delta-ridge',
    name: 'Delta Ridge Camp',
    coordinates: [18.47, 77.51],
    grid: { x: 3, y: 2 },
    detail: 'Candidate waypoint near ancient river-delta sediment deposits.',
    dataLabel: 'Demonstration',
  },
  {
    id: 'carbonate-edge',
    name: 'Carbonate Edge Outpost',
    coordinates: [18.51, 77.58],
    grid: { x: 6, y: 5 },
    detail: 'Training destination near carbonate-bearing units highlighted by NASA.',
    dataLabel: 'Demonstration',
  },
  {
    id: 'crater-rim-lab',
    name: 'Crater Rim Mobile Lab',
    coordinates: [18.53, 77.63],
    grid: { x: 7, y: 6 },
    detail: 'High-elevation mission target for panoramic sampling exercises.',
    dataLabel: 'Demonstration',
  },
]

export const scientificPoints: ScientificPoint[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater Delta',
    coordinates: [18.45, 77.42],
    summary: 'Ancient delta deposits where Perseverance is collecting samples.',
    source: 'NASA Mars 2020 mission overview',
    sourceUrl:
      'https://science.nasa.gov/mission/mars-2020-perseverance/where-is-perseverance/',
    dataLabel: 'NASA verified',
  },
  {
    id: 'nili-fossae',
    name: 'Nili Fossae Carbonates',
    coordinates: [18.71, 77.74],
    summary: 'Carbonate-rich terrain of astrobiological interest near Jezero.',
    source: 'NASA Mars Trek / planetary geology references',
    sourceUrl: 'https://trek.nasa.gov/mars/',
    dataLabel: 'NASA verified',
  },
  {
    id: 'subsurface-pocket',
    name: 'Subsurface Ice Pocket (training target)',
    coordinates: [18.39, 77.62],
    summary:
      'Illustrative training point used to simulate mission planning under uncertainty.',
    source: 'Mars Navigator AI demonstration dataset',
    sourceUrl: 'https://pds.nasa.gov/',
    dataLabel: 'Demonstration',
  },
]

export const hazardZones: HazardZone[] = [
  {
    id: 'dune-field',
    name: 'Loose Dune Field',
    center: [18.5, 77.56],
    radiusMeters: 1300,
    note: 'Illustrative soft-soil zone that may increase wheel slippage risk.',
    label: 'Illustrative hazard',
  },
  {
    id: 'slope-band',
    name: 'Steep Slope Band',
    center: [18.47, 77.61],
    radiusMeters: 900,
    note: 'Illustrative high-gradient region requiring route review by mission control.',
    label: 'Illustrative hazard',
  },
]

export const metersPerGridStep = 120

export const estimatedMetersPerMinute = 28
