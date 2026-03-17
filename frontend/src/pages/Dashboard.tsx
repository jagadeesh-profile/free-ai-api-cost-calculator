import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useOrganizations, useAnalyticsSummary } from '../hooks'
import { useAuthStore } from '../store/auth'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Fetch organizations for the user
  const { data: orgsData, isLoading: orgsLoading, error: orgsError } = useOrganizations()
  
  // Set first org as selected by default
  React.useEffect(() => {
    if (orgsData?.data && orgsData.data.length > 0 && !selectedOrgId) {
      setSelectedOrgId(orgsData.data[0].id)
    }
  }, [orgsData, selectedOrgId])

  // Fetch analytics for selected org
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsSummary(selectedOrgId)

  if (orgsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (orgsError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-red-800">Error loading organizations</h3>
        <p className="text-red-600 mt-2">{orgsError.message || 'An error occurred'}</p>
      </div>
    )
  }

  const organizations = orgsData?.data || []
  const selectedOrg = organizations.find(o => o.id === selectedOrgId)
  const analytics = analyticsData?.data

  // Transform analytics daily costs to chart format
  const dailyCosts = analytics?.daily_costs?.map(dc => ({
    date: new Date(dc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: dc.cost
  })) || []

  // Transform provider data for chart
  const providerChartData = dailyCosts.length > 0 ? dailyCosts : [
    { date: 'No Data', cost: 0 }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Monthly cost overview and organization analytics</p>
      </div>

      {/* Organization Selector */}
      {organizations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Organization
          </label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.plan})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Cost</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            ${analytics?.total_cost?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-600 mt-2">Current period</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Calculations</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {analytics?.total_calculations || 0}
          </p>
          <p className="text-xs text-gray-600 mt-2">Total in period</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Average Cost</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            ${analytics?.avg_cost?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-600 mt-2">Per calculation</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Top Provider</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {analytics?.top_providers?.[0]?.provider || 'N/A'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            ${analytics?.top_providers?.[0]?.total_cost?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Cost Trend</h2>
          {analyticsLoading ? (
            <div className="h-80 flex items-center justify-center">
              <span className="text-gray-500">Loading data...</span>
            </div>
          ) : providerChartData.length > 0 && providerChartData[0].date !== 'No Data' ? (
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
          {analyticsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : analytics?.top_providers && analytics.top_providers.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_providers.map((provider) => (
                <div key={provider.provider} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{provider.provider}</p>
                    <p className="text-xs text-gray-600">${provider.total_cost?.toFixed(2)}</p>
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${provider.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 w-12 text-right">{provider.percentage?.toFixed(1)}%</p>
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

      {/* Organization Details */}
      {selectedOrg && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">{selectedOrg.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{selectedOrg.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-lg font-semibold text-gray-800">{selectedOrg.member_count || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {organizations.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <h3 className="font-bold text-blue-800">No Organizations</h3>
          <p className="text-blue-700 mt-1">Create your first organization to get started tracking costs.</p>
        </div>
      )}
    </div>
  )
}
