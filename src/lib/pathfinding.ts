import type { GridCoord } from '../data/marsDemoData'

type Node = {
  position: GridCoord
  gScore: number
  fScore: number
  parent?: Node
}

export type RouteSummary = {
  path: GridCoord[]
  totalCost: number
  averageDifficulty: number
}

const deltas: GridCoord[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

const keyFor = ({ x, y }: GridCoord): string => `${x},${y}`

const heuristic = (a: GridCoord, b: GridCoord): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const isValid = (grid: number[][], { x, y }: GridCoord): boolean =>
  y >= 0 && y < grid.length && x >= 0 && x < grid[0].length

export const findAStarRoute = (
  grid: number[][],
  blockedCells: GridCoord[],
  start: GridCoord,
  goal: GridCoord,
): RouteSummary | null => {
  if (!isValid(grid, start) || !isValid(grid, goal)) {
    return null
  }

  const blocked = new Set(blockedCells.map(keyFor))
  if (blocked.has(keyFor(start)) || blocked.has(keyFor(goal))) {
    return null
  }

  const openList: Node[] = [
    {
      position: start,
      gScore: 0,
      fScore: heuristic(start, goal),
    },
  ]

  const bestScore = new Map<string, number>([[keyFor(start), 0]])

  while (openList.length > 0) {
    openList.sort((a, b) => a.fScore - b.fScore)
    const current = openList.shift()

    if (!current) {
      return null
    }

    if (keyFor(current.position) === keyFor(goal)) {
      const path: GridCoord[] = []
      let walker: Node | undefined = current
      let terrainCost = 0

      while (walker) {
        path.unshift(walker.position)
        terrainCost += grid[walker.position.y][walker.position.x]
        walker = walker.parent
      }

      return {
        path,
        totalCost: Number(current.gScore.toFixed(2)),
        averageDifficulty: Number((terrainCost / path.length).toFixed(2)),
      }
    }

    for (const delta of deltas) {
      const neighbor: GridCoord = {
        x: current.position.x + delta.x,
        y: current.position.y + delta.y,
      }

      if (!isValid(grid, neighbor) || blocked.has(keyFor(neighbor))) {
        continue
      }

      const movementCost = 1 + grid[neighbor.y][neighbor.x] / 10
      const tentativeG = current.gScore + movementCost
      const neighborKey = keyFor(neighbor)

      if (tentativeG >= (bestScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
        continue
      }

      bestScore.set(neighborKey, tentativeG)
      openList.push({
        position: neighbor,
        gScore: tentativeG,
        fScore: tentativeG + heuristic(neighbor, goal),
        parent: current,
      })
    }
  }

  return null
}
