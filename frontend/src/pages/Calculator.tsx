import { useMemo, useState } from 'react'
import { BarChart3, Brain, Database, Save } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  calculateCosts,
  estimateTokensFromText,
  HISTORY_KEY,
  PRESETS,
  PRICING,
  PROVIDER_LABELS,
  type CalculationInput,
  type HistoryEntry,
} from '../lib/pricing'

type InputMode = 'text' | 'tokens'

const PIE_COLORS = ['#ef4444', '#0ea5e9']

export default function Calculator() {
  const providerKeys = Object.keys(PRICING)
  const [provider, setProvider] = useState(providerKeys[0])
  const [model, setModel] = useState(Object.keys(PRICING[providerKeys[0]])[0])

  const [mode, setMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [outputTokenRatio, setOutputTokenRatio] = useState(1.25)

  const [requests, setRequests] = useState(1000)
  const [manualInputTokens, setManualInputTokens] = useState(200)
  const [manualOutputTokens, setManualOutputTokens] = useState(300)

  const [growthRate, setGrowthRate] = useState(10)
  const [discountRate, setDiscountRate] = useState(0)
  const [enterpriseRate, setEnterpriseRate] = useState(0)
  const [useCache, setUseCache] = useState(false)
  const [useBatch, setUseBatch] = useState(false)

  const inputTokens = mode === 'text' ? estimateTokensFromText(inputText) : manualInputTokens
  const outputTokens = mode === 'text' ? Math.ceil(inputTokens * outputTokenRatio) : manualOutputTokens

  const calculationInput: CalculationInput = {
    provider,
    model,
    requests,
    inputTokens,
    outputTokens,
    growthRate,
    discountRate,
    enterpriseRate,
    useCache,
    useBatch,
  }

  const result = useMemo(
    () => calculateCosts(calculationInput),
    [
      provider,
      model,
      requests,
      inputTokens,
      outputTokens,
      growthRate,
      discountRate,
      enterpriseRate,
      useCache,
      useBatch,
    ],
  )

  const pieData = [
    { name: 'Input', value: result.inputCost },
    { name: 'Output', value: result.outputCost },
  ]

  const modelComparisons = useMemo(() => {
    return Object.entries(PRICING[provider])
      .map(([modelName]) => {
        const modelResult = calculateCosts({ ...calculationInput, model: modelName })
        return {
          model: modelName,
          total: modelResult.total,
        }
      })
      .sort((a, b) => a.total - b.total)
  }, [provider, calculationInput])

  const handleProviderChange = (nextProvider: string) => {
    setProvider(nextProvider)
    const firstModel = Object.keys(PRICING[nextProvider])[0]
    setModel(firstModel)
  }

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const p = PRESETS[preset]
    setRequests(p.requests)
    setManualInputTokens(p.inputTokens)
    setManualOutputTokens(p.outputTokens)
  }

  const saveSnapshot = () => {
    const raw = localStorage.getItem(HISTORY_KEY)
    const existing = raw ? (JSON.parse(raw) as HistoryEntry[]) : []

    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      provider,
      model,
      total: result.total,
      inputCost: result.inputCost,
      outputCost: result.outputCost,
      requests,
      inputTokens,
      outputTokens,
      projection12Months: result.projection12Months,
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify([...existing, entry]))
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">API Cost Calculator</h1>
        <p className="text-slate-600 mt-2 text-base">Compare OpenAI, Claude, Gemini and more with text or token input.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Provider</label>
                <select
                  title="Provider"
                  aria-label="Provider"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                >
                  {providerKeys.map((key) => (
                    <option key={key} value={key}>
                      {PROVIDER_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Model</label>
                <select
                  title="Model"
                  aria-label="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                >
                  {Object.keys(PRICING[provider]).map((modelName) => (
                    <option key={modelName} value={modelName}>
                      {modelName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode('text')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'text' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Text Input
              </button>
              <button
                onClick={() => setMode('tokens')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'tokens' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Token Counts
              </button>
            </div>

            {mode === 'text' ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Paste Prompt Text</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  placeholder="Enter your text"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    Estimated input tokens: <strong>{inputTokens.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    Estimated output tokens: <strong>{outputTokens.toLocaleString()}</strong>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Output Token Ratio ({outputTokenRatio.toFixed(2)}x)</label>
                  <input
                    type="range"
                    title="Output token ratio"
                    aria-label="Output token ratio"
                    min={0.5}
                    max={2.5}
                    step={0.05}
                    value={outputTokenRatio}
                    onChange={(e) => setOutputTokenRatio(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Input Tokens per Request</label>
                  <input
                    type="number"
                    min={1}
                    title="Input tokens"
                    placeholder="200"
                    value={manualInputTokens}
                    onChange={(e) => setManualInputTokens(Number(e.target.value))}
                    className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Output Tokens per Request</label>
                  <input
                    type="number"
                    min={1}
                    title="Output tokens"
                    placeholder="300"
                    value={manualOutputTokens}
                    onChange={(e) => setManualOutputTokens(Number(e.target.value))}
                    className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Requests</label>
                <input
                  type="number"
                  min={1}
                  title="Requests"
                  placeholder="1000"
                  value={requests}
                  onChange={(e) => setRequests(Number(e.target.value))}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Growth %</label>
                <input
                  type="number"
                  min={0}
                  title="Growth rate"
                  placeholder="10"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Discount %</label>
                <input
                  type="number"
                  min={0}
                  title="Discount rate"
                  placeholder="0"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Enterprise %</label>
                <input
                  type="number"
                  min={0}
                  title="Enterprise rate"
                  placeholder="0"
                  value={enterpriseRate}
                  onChange={(e) => setEnterpriseRate(Number(e.target.value))}
                  className="w-full mt-2 border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyPreset('chatbot')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm">
                Chatbot Preset
              </button>
              <button onClick={() => applyPreset('content')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm">
                Content Preset
              </button>
              <button onClick={() => applyPreset('support')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm">
                Support Preset
              </button>
              <button onClick={() => applyPreset('code')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm">
                Code Preset
              </button>
            </div>

            <div className="flex gap-6 text-sm font-medium text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={useCache} onChange={(e) => setUseCache(e.target.checked)} /> Prompt Caching
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={useBatch} onChange={(e) => setUseBatch(e.target.checked)} /> Batch API
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5">
              <p className="text-sm text-slate-200">Total Cost</p>
              <p className="text-3xl font-black mt-2">${result.total.toFixed(2)}</p>
              <p className="text-xs text-slate-300 mt-1">Per selected workload</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Monthly Projection</p>
              <p className="text-3xl font-black text-slate-900 mt-2">${result.monthly.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Yearly Projection</p>
              <p className="text-3xl font-black text-slate-900 mt-2">${result.yearly.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Database size={18} /> Cost Distribution
            </h3>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={18} /> 12-Month Projection
            </h3>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.projection12Months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Area type="monotone" dataKey="cost" stroke="#0f172a" fill="#cbd5e1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Brain size={18} /> Analysis
            </h3>
            <ul className="list-disc ml-5 mt-3 text-sm text-slate-600 space-y-2">
              <li>Per request estimate: ${result.perRequest.toFixed(4)}</li>
              <li>
                Input cost: ${result.inputCost.toFixed(2)} | Output cost: ${result.outputCost.toFixed(2)}
              </li>
              <li>{useCache ? 'Caching enabled.' : 'Enable caching if model supports it for lower prompt costs.'}</li>
              <li>{useBatch ? 'Batch mode enabled.' : 'Enable batch mode for asynchronous workloads to reduce cost.'}</li>
            </ul>
            <button
              onClick={saveSnapshot}
              className="mt-4 w-full bg-emerald-600 text-white rounded-xl py-3 font-semibold inline-flex justify-center items-center gap-2"
            >
              <Save size={16} /> Save Snapshot to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Model Comparison ({PROVIDER_LABELS[provider]})</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {modelComparisons.map((entry) => (
            <div key={entry.model} className="py-3 flex items-center justify-between text-sm">
              <span className={`font-medium ${entry.model === model ? 'text-slate-900' : 'text-slate-600'}`}>{entry.model}</span>
              <span className={`font-bold ${entry.model === model ? 'text-indigo-600' : 'text-slate-700'}`}>${entry.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
