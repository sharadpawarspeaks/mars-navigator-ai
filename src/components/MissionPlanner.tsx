import { useState } from 'react'

type MissionPlannerProps = {
  start: string
  destination: string
  distanceMeters: number
  travelMinutes: number
  averageDifficulty: number
}

const objectives = [
  'Collect regolith and carbonate samples',
  'Capture high-resolution multispectral images',
  'Deploy atmospheric telemetry beacon',
]

export function MissionPlanner({
  start,
  destination,
  distanceMeters,
  travelMinutes,
  averageDifficulty,
}: MissionPlannerProps) {
  const [notes, setNotes] = useState('')

  return (
    <section id="mission-planner" className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Mission planner</h3>
        <p className="text-sm text-slate-300">Illustrative schedule until route models are calibrated with validated terrain telemetry.</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Start point</p>
          <p className="mt-1 text-slate-100">{start}</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Destination</p>
          <p className="mt-1 text-slate-100">{destination}</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Estimated distance</p>
          <p className="mt-1 text-slate-100">{distanceMeters.toFixed(0)} m</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Estimated travel duration</p>
          <p className="mt-1 text-slate-100">{travelMinutes.toFixed(1)} min</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Terrain difficulty score</p>
          <p className="mt-1 text-slate-100">{averageDifficulty.toFixed(2)} / 10</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-950/60 p-3 text-sm">
        <p className="mb-2 font-medium text-slate-100">Mission objectives</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>

      <label className="mt-4 block text-sm text-slate-200" htmlFor="mission-notes">
        Planning notes
      </label>
      <textarea
        id="mission-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={4}
        placeholder="Add EVA constraints, equipment, and communication windows..."
        className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-red-400 transition focus:ring"
      />
    </section>
  )
}
