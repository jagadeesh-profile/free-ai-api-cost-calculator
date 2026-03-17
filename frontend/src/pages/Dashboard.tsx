import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type HistoryEntry = {
  timestamp: string
  total: number
  itemsCount: number
  providerBreakdown: Record<string, number>
}

const HISTORY_KEY = 'cost_calc_history'

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
  const [history] = useState<HistoryEntry[]>(readHistory())

  const totalCost = history.reduce((sum, entry) => sum + entry.total, 0)
  const totalCalculations = history.length
  const avgCost = totalCalculations > 0 ? totalCost / totalCalculations : 0

  const providerTotals = history.reduce<Record<string, number>>((acc, entry) => {
    Object.entries(entry.providerBreakdown).forEach(([provider, cost]) => {
      acc[provider] = (acc[provider] || 0) + cost
    })
    return acc
  }, {})

  const topProviders = Object.entries(providerTotals)
    .map(([provider, cost]) => ({ provider, totalCost: cost }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5)
    .map((provider) => ({
      ...provider,
      percentage: totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0,
    }))

  const dailyMap: Record<string, number> = {}
  history.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap[date] = (dailyMap[date] || 0) + entry.total
  })
  const dailyCosts = Object.entries(dailyMap).map(([date, cost]) => ({ date, cost }))

  const providerChartData = dailyCosts.length > 0 ? dailyCosts : [
    { date: 'No Data', cost: 0 }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Local analytics overview (GitHub Pages compatible)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Cost</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            ${totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Current period</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Calculations</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalCalculations}
          </p>
          <p className="text-xs text-gray-600 mt-2">Total in period</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Average Cost</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            ${avgCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Per calculation</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Top Provider</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {topProviders[0]?.provider || 'N/A'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            ${topProviders[0]?.totalCost?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Cost Trend</h2>
          {providerChartData.length > 0 && providerChartData[0].date !== 'No Data' ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={providerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>

        {/* Top Providers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top Providers</h2>
          {topProviders.length > 0 ? (
            <div className="space-y-3">
              {topProviders.map((provider) => (
                <div key={provider.provider} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{provider.provider}</p>
                    <p className="text-xs text-gray-600">${provider.totalCost?.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-700 w-12 text-right">{provider.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">No provider data</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <h3 className="font-bold text-blue-800">No Calculations Yet</h3>
          <p className="text-blue-700 mt-1">Go to Calculator and save a calculation to see analytics here.</p>
        </div>
      )}
    </div>
  )
}
