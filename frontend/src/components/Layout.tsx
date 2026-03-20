import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Calculator, Settings, Rocket } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <header className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">API Cost Calculator</h1>
      </header>

      {/* Sidebar */}
      <div className="hidden md:flex w-72 bg-white shadow-sm border-r border-slate-200 flex-col">
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

          <a
            href="/instantdeploy/"
            className="flex items-center gap-3 px-6 py-3 text-emerald-700 hover:bg-emerald-50 mt-4 border-t border-slate-100"
          >
            <Rocket size={20} />
            <span className="font-semibold">Instant Deploy</span>
          </a>
        </nav>

        <div className="p-6 border-t border-slate-200 text-xs text-slate-500">
          No login required. All calculations run locally in your browser.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 grid grid-cols-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/') ? 'text-slate-900' : 'text-slate-500'}`}
        >
          <Home size={18} />
          Dashboard
        </Link>
        <Link
          to="/calculator"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/calculator') ? 'text-slate-900' : 'text-slate-500'}`}
        >
          <Calculator size={18} />
          Calculator
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/settings') ? 'text-slate-900' : 'text-slate-500'}`}
        >
          <Settings size={18} />
          Settings
        </Link>
        <a
          href="/instantdeploy/"
          className="flex flex-col items-center justify-center py-2 text-xs text-emerald-700"
        >
          <Rocket size={18} />
          Deploy
        </a>
      </nav>
    </div>
  )
}
