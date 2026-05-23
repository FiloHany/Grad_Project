import { Sun, Moon, UserCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AppHeader({ title, isAnalyzing, apiOnline, doctor }) {
  const { theme, toggleTheme } = useTheme()
  const { logout }             = useAuth()
  const navigate               = useNavigate()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      {/* Left: title + processing badge */}
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">{title}</span>
        {isAnalyzing && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-700">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        )}
      </div>

      {/* Right: date + status + theme + user */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium hidden md:block">{today}</span>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 hidden md:block" />

        {/* API status dot */}
        <div
          title={apiOnline ? 'All systems operational' : 'Backend unreachable'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            apiOnline
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            apiOnline === null ? 'bg-gray-400 animate-pulse'
              : apiOnline ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]'
              : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]'
          }`} />
          {apiOnline === null ? 'Checking…' : apiOnline ? 'Online' : 'Offline'}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 transform transition-all duration-200"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Doctor name */}
        {doctor && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate hidden sm:block">
                Dr. {doctor.full_name.split(' ').pop()}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
