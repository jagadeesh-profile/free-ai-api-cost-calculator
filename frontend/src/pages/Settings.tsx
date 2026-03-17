import React, { useState } from 'react'
import { Key, Save, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/auth'

type StoredApiKey = {
  id: string
  provider: string
  keyHint: string
  createdAt: string
}

const SUPPORTED_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Cohere',
  'HuggingFace',
  'Azure',
  'AWS',
  'Custom',
]

const STORAGE_KEYS = {
  profile: 'settings_profile',
  apiKeys: 'settings_api_keys',
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const maskApiKey = (value: string) => {
  if (value.length <= 8) return '****'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const initialProfile = readJson(STORAGE_KEYS.profile, {
    name: user?.name || '',
    email: user?.email || '',
  })

  const [name, setName] = useState(initialProfile.name)
  const [email, setEmail] = useState(initialProfile.email)
  const [provider, setProvider] = useState(SUPPORTED_PROVIDERS[0])
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeys, setApiKeys] = useState<StoredApiKey[]>(readJson(STORAGE_KEYS.apiKeys, []))
  const [message, setMessage] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ name, email }))
    setMessage('Profile saved locally.')
  }

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKeyInput.trim()) return

    const newKey: StoredApiKey = {
      id: crypto.randomUUID(),
      provider,
      keyHint: maskApiKey(apiKeyInput),
      createdAt: new Date().toISOString(),
    }

    const updated = [...apiKeys, newKey]
    setApiKeys(updated)
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(updated))
    setApiKeyInput('')
    setMessage('API key saved locally in this browser.')
  }

  const handleDeleteKey = (id: string) => {
    const updated = apiKeys.filter((key) => key.id !== id)
    setApiKeys(updated)
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(updated))
    setMessage('API key removed.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage local profile and API keys (GitHub Pages compatible)</p>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">{message}</div>}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              title="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              title="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key size={24} />
          API Keys
        </h2>

        <form onSubmit={handleAddKey} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
          <h3 className="font-medium text-blue-900">Add New API Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                title="Provider"
                aria-label="Provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {SUPPORTED_PROVIDERS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!apiKeyInput.trim()}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                <span className="inline-flex items-center gap-2">
                  <Save size={16} />
                  Add Key
                </span>
              </button>
            </div>
          </div>
        </form>

        {apiKeys.length > 0 ? (
          <div className="space-y-3">
            {apiKeys.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{config.provider}</p>
                  <p className="text-sm text-gray-600 mt-1">Key: {config.keyHint}</p>
                  <p className="text-xs text-gray-500 mt-1">Created: {new Date(config.createdAt).toLocaleDateString()}</p>
                </div>

                <button
                  onClick={() => handleDeleteKey(config.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-2"
                  title="Delete key"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-700">
            No API keys saved yet.
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
        <h3 className="font-bold text-yellow-800">Security Notice</h3>
        <p className="text-yellow-700 mt-1">
          In static-host mode, API keys are stored in localStorage and are not suitable for production secrets.
        </p>
      </div>
    </div>
  )
}
