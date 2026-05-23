import { LayoutDashboard, PlusCircle, History, Heart, LogOut, User, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { key: 'dashboard',    Icon: LayoutDashboard, label: 'Dashboard'    },
  { key: 'new-analysis', Icon: PlusCircle,       label: 'New Analysis' },
  { key: 'history',      Icon: History,          label: 'Study History' },
]

export default function AppSidebar({ activeView, onNavigate, jobCount, isAnalyzing, doctor }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 z-50 flex flex-col bg-gradient-to-b from-indigo-900 via-indigo-950 to-gray-950 shadow-2xl">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-25 rounded-full group-hover:opacity-40 transition" />
            <img src="/logo.png" alt="CardioVision" className="w-12 h-12 relative z-10 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              CardioVision
            </div>
            <div className="text-xs text-indigo-400/60 font-medium tracking-widest uppercase mt-0.5">
              Cardiac AI
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-xs font-bold tracking-[1.4px] text-white/20 uppercase px-3 pb-2">Menu</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ key, Icon, label }) => {
            const isActive = activeView === key
            const isLive   = key === 'new-analysis' && isAnalyzing
            return (
              <li key={key}>
                <button
                  onClick={() => onNavigate(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600/30 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'text-indigo-200/70 hover:bg-white/7 hover:text-white'
                  }`}
                >
                  {isLive
                    ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-orange-400" />
                    : <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400/60 group-hover:text-indigo-300'}`} />
                  }
                  <span className="flex-1 text-left">{label}</span>
                  {isLive && (
                    <span className="text-[9px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full tracking-wide">
                      LIVE
                    </span>
                  )}
                  {key === 'history' && jobCount > 0 && !isLive && (
                    <span className="text-xs font-bold bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                      {jobCount > 9 ? '9+' : jobCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Doctor card + logout */}
      <div className="flex-shrink-0 px-3 pb-4 border-t border-white/10 pt-3">
        {doctor && (
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/8">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{doctor.full_name}</div>
              <div className="text-xs text-indigo-300/50 truncate mt-0.5">{doctor.specialty || 'Cardiologist'}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
