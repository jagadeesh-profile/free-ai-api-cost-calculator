import React, { useState } from 'react'
import { Calculator as CalcIcon, Plus, Trash2, Loader } from 'lucide-react'
import { useCalculateCost, useAnalyticsSummary } from '../api/hooks'
import { useAuthStore } from '../store/auth'

interface CalculationItem {
  id: string
  provider: string
  tokens: number
  rate: number
}

export default function Calculator() {
  const user = useAuthStore((state) => state.user)
  const orgId = user?.id || '' // In real app, would be from params
  
  const [items, setItems] = useState<CalculationItem[]>([])
  const [newItem, setNewItem] = useState({ provider: '', tokens: 0, rate: 0 })

  const calculateMutation = useCalculateCost(orgId)
  const analyticsQuery = useAnalyticsSummary(orgId)

  const addItem = () => {
    if (!newItem.provider || newItem.tokens === 0 || newItem.rate === 0) return

    setItems([
      ...items,
      {
        id: Math.random().toString(),
        ...newItem,
      },
    ])
    setNewItem({ provider: '', tokens: 0, rate: 0 })
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleCalculate = async () => {
    if (items.length === 0) return
    
    const calculationItems = items.map(item => ({
      provider: item.provider,
      usage: item.tokens,
      rate: item.rate,
    }))

    calculateMutation.mutate({ items: calculationItems }, {
      onSuccess: () => {
        // Clear items after successful calculation
        setItems([])
      },
    })
  }

  const result = calculateMutation.data
  const total = result?.data?.total_cost || 0
  const breakdown = result?.data?.breakdown || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Cost Calculator</h1>
        <p className="text-gray-600">Calculate API costs based on usage and rates</p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Add Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <select
              value={newItem.provider}
              onChange={(e) => setNewItem({ ...newItem, provider: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select provider</option>
              <option value="OpenAI GPT-4">OpenAI GPT-4</option>
              <option value="OpenAI GPT-3.5">OpenAI GPT-3.5</option>
              <option value="Anthropic Claude">Anthropic Claude</option>
              <option value="Cohere">Cohere</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tokens</label>
            <input
              type="number"
              value={newItem.tokens}
              onChange={(e) => setNewItem({ ...newItem, tokens: Number(e.target.value) })}
              placeholder="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate (per 1K)</label>
            <input
              type="number"
              value={newItem.rate}
              onChange={(e) => setNewItem({ ...newItem, rate: Number(e.target.value) })}
              placeholder="0.03"
              step="0.001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Provider</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tokens</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{item.provider}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{item.tokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">${item.rate.toFixed(4)}</td>
                  <td className="px-6 py-3 text-right text-sm">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculate Button */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {calculateMutation.isPending && <Loader size={18} className="animate-spin" />}
              Calculate Cost
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Results</h3>
          <div className="text-4xl font-bold text-green-600 mb-6">
            ${total.toFixed(2)}
          </div>

          {Object.keys(breakdown).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Cost Breakdown</h4>
              {Object.entries(breakdown).map(([provider, cost]) => (
                <div key={provider} className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">{provider}</span>
                  <span className="font-medium">${(cost as number).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {calculateMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error calculating costs. Please try again.</p>
        </div>
      )}

      {/* Analytics */}
      {analyticsQuery.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">30-Day Summary</h3>
          <p className="text-blue-700">
            Total Cost: <span className="font-bold">${analyticsQuery.data.data.total_cost_30_days.toFixed(2)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
