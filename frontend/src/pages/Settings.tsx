import { useMemo, useState } from 'react'
import { HISTORY_KEY, type HistoryEntry } from '../lib/pricing'

const PREFERENCES_KEY = 'calculator_preferences'

type Preferences = {
  defaultRequests: number
  defaultGrowthRate: number
  compactCards: boolean
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default function Settings() {
  const defaults: Preferences = {
    defaultRequests: 1000,
    defaultGrowthRate: 10,
    compactCards: false,
  }

  const [prefs, setPrefs] = useState<Preferences>(readJson(PREFERENCES_KEY, defaults))
  const [message, setMessage] = useState('')

  const stats = useMemo(() => {
    const history = readJson<HistoryEntry[]>(HISTORY_KEY, [])
    const total = history.reduce((sum, h) => sum + h.total, 0)
    return { count: history.length, total }
  }, [message])

  const savePrefs = () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
    setMessage('Preferences saved.')
  }

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY)
    setMessage('Calculation history cleared.')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Personalize the calculator behavior. API key storage has been removed.</p>
      </div>

      {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3">{message}</div>}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-xl font-black text-slate-900">Defaults</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Default Requests</label>
            <input
              type="number"
              min={1}
              title="Default requests"
              placeholder="1000"
              value={prefs.defaultRequests}
              onChange={(e) => setPrefs({ ...prefs, defaultRequests: Number(e.target.value) })}
              className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Default Growth %</label>
            <input
              type="number"
              min={0}
              title="Default growth"
              placeholder="10"
              value={prefs.defaultGrowthRate}
              onChange={(e) => setPrefs({ ...prefs, defaultGrowthRate: Number(e.target.value) })}
              className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={prefs.compactCards}
            onChange={(e) => setPrefs({ ...prefs, compactCards: e.target.checked })}
          />
          Use compact result cards
        </label>
        <button onClick={savePrefs} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold">
          Save Preferences
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
        <h2 className="text-xl font-black text-slate-900">Data</h2>
        <p className="text-slate-600 text-sm">Snapshots saved: {stats.count} | Total recorded cost: ${stats.total.toFixed(2)}</p>
        <button onClick={clearHistory} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold">
          Clear All History
        </button>
      </div>
    </div>
  )
}
