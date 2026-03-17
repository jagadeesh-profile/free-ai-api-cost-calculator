export type ModelPricing = {
  input: number
  output: number
  cache: boolean
  batch: boolean
  desc: string
}

export type ProviderPricing = Record<string, ModelPricing>

export const PRICING: Record<string, ProviderPricing> = {
  openai: {
    'GPT-5.2 Pro': { input: 21.0, output: 168.0, cache: true, batch: true, desc: 'Maximum capability flagship' },
    'GPT-5.2': { input: 1.75, output: 14.0, cache: true, batch: true, desc: 'Standard advanced model' },
    'GPT-5 mini': { input: 0.25, output: 2.0, cache: true, batch: true, desc: 'Fast, everyday tasks' },
    'GPT-5 nano': { input: 0.05, output: 0.4, cache: true, batch: true, desc: 'Budget tier efficiency' },
    'GPT-4o': { input: 2.5, output: 10.0, cache: true, batch: true, desc: 'Legacy flagship' },
    'GPT-4o Mini': { input: 0.15, output: 0.6, cache: true, batch: true, desc: 'Fast legacy model' },
  },
  anthropic: {
    'Claude 4.6 Opus': { input: 5.0, output: 25.0, cache: true, batch: true, desc: 'Most intelligent and capable' },
    'Claude 4.5 Sonnet': { input: 3.0, output: 15.0, cache: true, batch: true, desc: 'Best balance of speed and quality' },
    'Claude 4.5 Haiku': { input: 1.0, output: 5.0, cache: true, batch: true, desc: 'Fastest and most efficient' },
  },
  google: {
    'Gemini 3 Pro': { input: 2.0, output: 12.0, cache: false, batch: false, desc: 'Next-gen flagship' },
    'Gemini 3 Flash': { input: 0.5, output: 3.0, cache: false, batch: false, desc: 'Speed and efficiency' },
    'Gemini 2.5 Flash-Lite': { input: 0.1, output: 0.4, cache: false, batch: false, desc: 'Ultra-budget model' },
  },
  mistral: {
    'Mistral Large 2': { input: 3.0, output: 9.0, cache: false, batch: false, desc: 'Latest reasoning' },
    'Mistral Medium': { input: 0.7, output: 2.1, cache: false, batch: false, desc: 'Balanced' },
  },
  cohere: {
    'Command R+': { input: 3.0, output: 15.0, cache: false, batch: false, desc: 'Advanced RAG' },
    'Command R': { input: 0.5, output: 1.5, cache: false, batch: false, desc: 'Long context' },
  },
}

export const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  mistral: 'Mistral',
  cohere: 'Cohere',
}

export const PRESETS = {
  chatbot: { requests: 1000, inputTokens: 100, outputTokens: 150 },
  content: { requests: 50, inputTokens: 200, outputTokens: 800 },
  support: { requests: 500, inputTokens: 300, outputTokens: 200 },
  code: { requests: 20, inputTokens: 500, outputTokens: 1000 },
}

export type CalculationInput = {
  provider: string
  model: string
  requests: number
  inputTokens: number
  outputTokens: number
  growthRate: number
  discountRate: number
  enterpriseRate: number
  useCache: boolean
  useBatch: boolean
}

export type CalculationResult = {
  inputCost: number
  outputCost: number
  total: number
  perRequest: number
  monthly: number
  yearly: number
  projection12Months: { month: string; cost: number }[]
}

export type HistoryEntry = {
  timestamp: string
  provider: string
  model: string
  total: number
  inputCost: number
  outputCost: number
  requests: number
  inputTokens: number
  outputTokens: number
  projection12Months: { month: string; cost: number }[]
}

export const HISTORY_KEY = 'cost_calc_history'

export function estimateTokensFromText(text: string): number {
  const normalized = text.trim()
  if (!normalized) return 0
  const words = normalized.split(/\s+/).length
  const chars = normalized.length
  const byWords = Math.ceil(words * 1.35)
  const byChars = Math.ceil(chars / 4)
  return Math.max(byWords, byChars)
}

export function calculateCosts(input: CalculationInput): CalculationResult {
  const pricing = PRICING[input.provider]?.[input.model]
  if (!pricing) {
    return {
      inputCost: 0,
      outputCost: 0,
      total: 0,
      perRequest: 0,
      monthly: 0,
      yearly: 0,
      projection12Months: [],
    }
  }

  let inputPrice = pricing.input
  let outputPrice = pricing.output

  if (input.useCache && pricing.cache) {
    inputPrice = inputPrice * 0.37
  }

  if (input.useBatch && pricing.batch) {
    inputPrice *= 0.5
    outputPrice *= 0.5
  }

  const totalInputTokens = input.requests * input.inputTokens
  const totalOutputTokens = input.requests * input.outputTokens

  const rawInputCost = (totalInputTokens / 1000000) * inputPrice
  const rawOutputCost = (totalOutputTokens / 1000000) * outputPrice
  const reductionMultiplier = (1 - input.discountRate / 100) * (1 - input.enterpriseRate / 100)

  const inputCost = rawInputCost * reductionMultiplier
  const outputCost = rawOutputCost * reductionMultiplier
  const total = inputCost + outputCost
  const perRequest = input.requests > 0 ? total / input.requests : 0
  const monthly = total * 30
  const yearly = total * 365

  const projection12Months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() + index)
    return {
      month: date.toLocaleString('en-US', { month: 'short' }),
      cost: monthly * Math.pow(1 + input.growthRate / 100, index),
    }
  })

  return {
    inputCost,
    outputCost,
    total,
    perRequest,
    monthly,
    yearly,
    projection12Months,
  }
}
