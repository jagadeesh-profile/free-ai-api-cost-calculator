import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as api from './endpoints'
import { useAuthStore } from '../store/auth'

// Auth hooks
export const useRegister = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: api.authAPI.register,
    onSuccess: (data) => {
      login({
        id: data.user_id,
        email: data.email,
        name: data.name,
        token: data.token,
      })
      navigate('/')
    },
  })
}

export const useLogin = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: api.authAPI.login,
    onSuccess: (data) => {
      login({
        id: data.user_id,
        email: data.email,
        name: data.name,
        token: data.token,
      })
      navigate('/')
    },
  })
}

// Organization hooks
export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: api.organizationAPI.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, plan }: { name: string; plan: string }) =>
      api.organizationAPI.create(name, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => api.organizationAPI.get(id),
    enabled: !!id,
  })
}

// Team hooks
export const useTeams = (orgId: string) => {
  return useQuery({
    queryKey: ['teams', orgId],
    queryFn: () => api.teamAPI.list(orgId),
    enabled: !!orgId,
  })
}

export const useCreateTeam =() => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
      api.teamAPI.create(orgId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.orgId] })
    },
  })
}

// Configuration hooks
export const useConfigurations = (orgId: string) => {
  return useQuery({
    queryKey: ['configurations', orgId],
    queryFn: () => api.configAPI.list(orgId),
    enabled: !!orgId,
  })
}

export const useCreateConfiguration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orgId,
      provider,
      apiKey,
      settings,
    }: {
      orgId: string
      provider: string
      apiKey: string
      settings?: string
    }) => api.configAPI.create(orgId, provider, apiKey, settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['configurations', variables.orgId] })
    },
  })
}

export const useDeleteConfiguration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.configAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] })
    },
  })
}

// Cost calculation hooks
export const useCalculateCost = (orgId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (items: Array<{ provider: string; tokens: number; rate: number }>) =>
      api.costAPI.calculate(orgId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations', orgId] })
    },
  })
}

export const useCostCalculations = (orgId: string) => {
  return useQuery({
    queryKey: ['calculations', orgId],
    queryFn: () => api.costAPI.list(orgId),
    enabled: !!orgId,
  })
}

// Analytics hooks
export const useAnalyticsSummary = (orgId: string) => {
  return useQuery({
    queryKey: ['analytics:summary', orgId],
    queryFn: () => api.analyticsAPI.summary(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
