import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { HISTORY_KEY, PROVIDER_LABELS, type HistoryEntry } from '../lib/pricing'

const readHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export default function Dashboard() {
  const history = readHistory()

  const summary = useMemo(() => {
    const totalCost = history.reduce((sum, entry) => sum + entry.total, 0)
    const avgCost = history.length > 0 ? totalCost / history.length : 0

    const providerTotals = history.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.provider] = (acc[entry.provider] || 0) + entry.total
      return acc
    }, {})

    const providerBreakdown = Object.entries(providerTotals)
      .map(([provider, total]) => ({
        provider: PROVIDER_LABELS[provider] || provider,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    const latestProjection = history.length > 0 ? history[history.length - 1].projection12Months : []

    const recent = [...history].slice(-10).map((entry) => ({
      time: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: entry.total,
    }))

    return {
      totalCost,
      avgCost,
      providerBreakdown,
      latestProjection,
      recent,
      snapshots: history.length,
      topModel: history.length > 0 ? history[history.length - 1].model : 'N/A',
    }
  }, [history])

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">ChatSLM Dashboard</h1>
        <p className="text-slate-600 mt-2">Cost analytics, provider breakdown, and forecast insights for AI API usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Total Cost</p>
          <p className="text-3xl font-black text-slate-900 mt-2">${summary.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Snapshots</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{summary.snapshots}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Average Cost</p>
          <p className="text-3xl font-black text-slate-900 mt-2">${summary.avgCost.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Last Model</p>
          <p className="text-xl font-black text-slate-900 mt-2">{summary.topModel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-4">Recent Snapshot Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.recent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-4">Provider Cost Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.providerBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-black text-slate-900 mb-4">12-Month Forecast from Latest Snapshot</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.latestProjection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="cost" stroke="#0f766e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {history.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          No snapshots yet. Open Calculator, run a scenario, and click Save Snapshot to populate analytics.
        </div>
      )}
    </div>
  )
}
