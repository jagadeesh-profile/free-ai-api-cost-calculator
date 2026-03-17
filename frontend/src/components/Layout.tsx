import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Calculator, Settings } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-sm border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">API Cost Calculator</h1>
          <p className="text-sm text-slate-600">Static, fast, and provider-agnostic</p>
        </div>

        <nav className="mt-6 flex-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/') ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home size={20} />
            <span className="font-semibold">Dashboard</span>
          </Link>

          <Link
            to="/calculator"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/calculator') ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calculator size={20} />
            <span className="font-semibold">Calculator</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-6 py-3 ${
              isActive('/settings') ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            <span className="font-semibold">Settings</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-200 text-xs text-slate-500">
          No login required. All calculations run locally in your browser.
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
