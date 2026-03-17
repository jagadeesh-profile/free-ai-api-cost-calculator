import React, { useState } from 'react'
import { Calculator as CalcIcon, Plus, Trash2 } from 'lucide-react'

interface CalculationItem {
  id: string
  provider: string
  tokens: number
  rate: number
  cost: number
}

export default function Calculator() {
  const [items, setItems] = useState<CalculationItem[]>([
    { id: '1', provider: 'OpenAI GPT-4', tokens: 1000, rate: 0.03, cost: 30 },
  ])
  const [newItem, setNewItem] = useState({ provider: '', tokens: 0, rate: 0 })

  const addItem = () => {
    if (!newItem.provider || newItem.tokens === 0 || newItem.rate === 0) return

    const cost = (newItem.tokens * newItem.rate) / 1000
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        ...newItem,
        cost,
      },
    ])
    setNewItem({ provider: '', tokens: 0, rate: 0 })
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.cost, 0)

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate (per 1K tokens)</label>
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

      {/* Calculation Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Usage Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Provider</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Tokens</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Rate (/1K)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Cost</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">{item.provider}</td>
                  <td className="py-4 px-4 text-right text-gray-800">{item.tokens.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-gray-800">${item.rate.toFixed(3)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-800">${item.cost.toFixed(2)}</td>
                  <td className="py-4 px-4 text-center">
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
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalcIcon className="text-blue-600" size={24} />
            <span className="text-lg font-bold text-gray-800">Total Cost:</span>
          </div>
          <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
