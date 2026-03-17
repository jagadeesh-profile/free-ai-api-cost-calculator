import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LogOut, Home, Calculator, Settings } from 'lucide-react'
import { useAuthStore } from '../store/auth'

export default function Layout() {
  const location = useLocation()
  const { logout } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Shaconnects</h1>
          <p className="text-sm text-gray-600">Cost Calculator v2.0</p>
        </div>

        <nav className="mt-6">
          <Link
            to="/"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/') ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/calculator"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/calculator') ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calculator size={20} />
            <span>Calculator</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/settings') ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
