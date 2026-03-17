import apiClient from './client'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  name: string
  password: string
}

interface AuthResponse {
  token: string
  user_id: string
  email: string
  name: string
}

// Auth API
export const authAPI = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', payload)
    return data
  },

  refresh: async (): Promise<{ token: string }> => {
    const { data } = await apiClient.post('/auth/refresh', {})
    return data
  },
}

// Organization API
export const organizationAPI = {
  list: async () => {
    const { data } = await apiClient.get('/orgs')
    return data.orgs
  },

  create: async (name: string, plan: string) => {
    const { data } = await apiClient.post('/orgs', { name, plan })
    return data
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/orgs/${id}`)
    return data
  },

  update: async (id: string, name: string, plan: string) => {
    const { data } = await apiClient.put(`/orgs/${id}`, { name, plan })
    return data
  },
}

// Team API
export const teamAPI = {
  list: async (orgId: string) => {
    const { data } = await apiClient.get(`/orgs/${orgId}/teams`)
    return data.teams
  },

  create: async (orgId: string, name: string) => {
    const { data } = await apiClient.post(`/orgs/${orgId}/teams`, { name })
    return data
  },

  update: async (teamId: string, name: string) => {
    const { data } = await apiClient.put(`/teams/${teamId}`, { name })
    return data
  },
}

// Configuration API (API Keys)
export const configAPI = {
  list: async (orgId: string) => {
    const { data } = await apiClient.get('/configurations', {
      headers: { 'X-Org-ID': orgId },
    })
    return data.configs
  },

  create: async (orgId: string, provider: string, apiKey: string, settings?: string) => {
    const { data } = await apiClient.post(
      '/configurations',
      { provider, api_key: apiKey, settings },
      { headers: { 'X-Org-ID': orgId } },
    )
    return data
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/configurations/${id}`)
    return data
  },

  update: async (id: string, provider: string, apiKey: string) => {
    const { data } = await apiClient.put(`/configurations/${id}`, {
      provider,
      api_key: apiKey,
    })
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/configurations/${id}`)
  },
}

// Cost Calculation API
interface CostItem {
  provider: string
  tokens: number
  rate: number
}

export const costAPI = {
  calculate: async (orgId: string, items: CostItem[]) => {
    const { data } = await apiClient.post('/calculate', { items }, {
      headers: { 'X-Org-ID': orgId },
    })
    return data
  },

  list: async (orgId: string) => {
    const { data } = await apiClient.get('/calculations', {
      headers: { 'X-Org-ID': orgId },
    })
    return data.calculations
  },
}

// Analytics API
export const analyticsAPI = {
  summary: async (orgId: string) => {
    const { data } = await apiClient.get('/analytics/summary', {
      headers: { 'X-Org-ID': orgId },
    })
    return data
  },
}
