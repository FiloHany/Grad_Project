import { Sun, Moon, UserCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function AppHeader({ title, isAnalyzing, apiOnline, doctor }) {
  const { theme, toggleTheme } = useTheme()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">

      {/* Left: page title + processing badge */}
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          {title}
        </span>
        {isAnalyzing && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-700/50">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        )}
      </div>

      {/* Right: date · status · theme · user */}
      <div className="flex items-center gap-3">

        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium hidden lg:block">
          {today}
        </span>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 hidden lg:block" />

        {/* API status pill */}
        <StatusPill online={apiOnline} />

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4 text-indigo-600" />
          }
        </button>

        {/* Doctor avatar + name */}
        {doctor && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2 select-none">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                <UserCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[130px] truncate hidden sm:block">
                Dr. {doctor.full_name.split(' ').pop()}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function StatusPill({ online }) {
  const isOnline  = online === true
  const isOffline = online === false

  return (
    <div
      title={isOnline ? 'All systems operational' : isOffline ? 'Backend unreachable' : 'Checking…'}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        isOnline
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/60 text-green-700 dark:text-green-400'
          : isOffline
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500',
      ].join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          isOnline ? 'bg-green-500' : isOffline ? 'bg-red-500' : 'bg-gray-400 animate-pulse',
        ].join(' ')}
        style={
          isOnline  ? { boxShadow: '0 0 0 2px rgba(34,197,94,0.3), 0 0 6px rgba(34,197,94,0.6)' }
          : isOffline ? { boxShadow: '0 0 0 2px rgba(239,68,68,0.3), 0 0 6px rgba(239,68,68,0.6)' }
          : {}
        }
      />
      {online === null ? 'Checking…' : isOnline ? 'Online' : 'Offline'}
    </div>
  )
}
