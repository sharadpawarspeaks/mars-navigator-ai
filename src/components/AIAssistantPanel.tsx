import { useState } from 'react'
import type { FormEvent } from 'react'

const hasApiKey = Boolean(import.meta.env.VITE_MARS_ASSISTANT_API_URL)

export function AIAssistantPanel() {
  const [question, setQuestion] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) {
      setMessage('Enter a Mars-related question to continue.')
      return
    }

    if (!hasApiKey) {
      setMessage('Live AI is unavailable. Add VITE_MARS_ASSISTANT_API_URL to connect a backend assistant endpoint.')
      return
    }

    setMessage('Assistant endpoint detected. Connect your backend route handler to complete live responses.')
  }

  return (
    <section id="ai-assistant" className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <h3 className="text-lg font-semibold text-white">AI mission assistant</h3>
      <p className="mt-1 text-sm text-slate-300">
        Ask route and science questions. This UI will only return live answers after you configure a backend AI endpoint.
      </p>

      {!hasApiKey && (
        <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-100">
          Setup required: define <code className="rounded bg-slate-950/70 px-1">VITE_MARS_ASSISTANT_API_URL</code> in a local
          <code className="rounded bg-slate-950/70 px-1">.env</code> file and proxy requests through a secure server.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label htmlFor="ai-question" className="block text-sm text-slate-200">
          Mars question
        </label>
        <input
          id="ai-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="How should we prioritize carbonate sampling stops?"
          className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-red-400 transition focus:ring"
        />
        <button
          type="submit"
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          Submit question
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </section>
  )
}
