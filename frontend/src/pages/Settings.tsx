import React, { useState } from 'react'
import { Key, Eye, EyeOff, Save, Trash2 } from 'lucide-react'
import { useConfigurations, useCreateConfiguration, useDeleteConfiguration } from '../hooks'
import { useAuthStore } from '../store/auth'

const SUPPORTED_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Cohere',
  'HuggingFace',
  'Azure',
  'AWS',
  'Custom'
]

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [newKey, setNewKey] = useState({ provider: '', api_key: '', settings: '' })
  const [orgId, setOrgId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch configurations
  const { 
    data: configsData, 
    isLoading: configsLoading, 
    error: configsError,
    refetch: refetchConfigs
  } = useConfigurations(orgId)

  // Create configuration mutation
  const createMutation = useCreateConfiguration()

  // Delete configuration mutation
  const deleteMutation = useDeleteConfiguration()

  const handleAddKey = async () => {
    if (!newKey.provider || !newKey.api_key) {
      alert('Please fill in all required fields')
      return
    }

    if (!orgId) {
      alert('Please select an organization first')
      return
    }

    setIsSubmitting(true)
    try {
      await createMutation.mutateAsync({
        org_id: orgId,
        provider: newKey.provider,
        api_key: newKey.api_key,
        settings: newKey.settings || '{}',
      })
      
      // Reset form
      setNewKey({ provider: '', api_key: '', settings: '' })
      
      // Refetch configurations
      refetchConfigs()
    } catch (error) {
      console.error('Error adding key:', error)
      alert('Failed to add API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteKey = async (configId: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(configId)
      refetchConfigs()
    } catch (error) {
      console.error('Error deleting key:', error)
      alert('Failed to delete API key')
    }
  }

  const configurations = configsData?.data || []
  const maskKey = (key: string) => {
    if (!key || key.length < 10) return key
    return key.substring(0, 5) + '•'.repeat(Math.max(0, key.length - 10)) + key.substring(key.length - 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage API keys and provider connections</p>
      </div>

      {/* Organization Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
        <input
          type="text"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="Enter your organization ID"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          Enter the organization ID to manage its API keys
        </p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key size={24} />
          API Keys
        </h2>

        {/* Add New Key Form */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-4">Add New API Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                value={newKey.provider}
                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select provider</option>
                {SUPPORTED_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={newKey.api_key}
                onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddKey}
                disabled={isSubmitting || !orgId || !newKey.provider || !newKey.api_key}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {isSubmitting ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </div>

          {/* Optional Settings */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Settings (JSON)</label>
            <textarea
              value={newKey.settings}
              onChange={(e) => setNewKey({ ...newKey, settings: e.target.value })}
              placeholder='{"model": "gpt-4"}'
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Optional JSON settings for the provider</p>
          </div>
        </div>

        {/* Loading State */}
        {configsLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading API keys...</p>
          </div>
        )}

        {/* Error State */}
        {configsError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600 mb-4">
            Error loading API keys: {configsError.message}
          </div>
        )}

        {/* Empty State */}
        {!configsLoading && configurations.length === 0 && orgId && (
          <div className="text-center py-8 bg-gray-50 rounded">
            <p className="text-gray-500">No API keys configured for this organization</p>
          </div>
        )}

        {/* Keys List */}
        {!configsLoading && configurations.length > 0 && (
          <div className="space-y-3">
            {configurations.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{config.provider}</p>
                    {config.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Key: {showKey === config.id ? config.api_key : maskKey(config.api_key)}
                  </p>
                  {config.created_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKey(showKey === config.id ? null : config.id)}
                    className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-200 rounded"
                    title={showKey === config.id ? 'Hide key' : 'Show key'}
                  >
                    {showKey === config.id ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  <button
                    onClick={() => handleDeleteKey(config.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-2"
                    title="Delete key"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Organization Selection Prompt */}
        {!orgId && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-700">
            Select an organization above to view and manage its API keys
          </div>
        )}
      </div>
    </div>
  )
}
