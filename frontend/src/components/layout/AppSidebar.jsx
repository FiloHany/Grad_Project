import { LayoutDashboard, PlusCircle, History, LogOut, User, Loader2, Settings } from 'lucide-react'
import { useAuth }     from '../../context/AuthContext'
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
    <aside
      className="fixed inset-y-0 left-0 w-60 z-50 flex flex-col shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0f0e20 50%, #080816 100%)' }}
    >
      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-white/10">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 group w-full">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-30 rounded-full group-hover:opacity-50 transition-opacity duration-300" />
            <img src="/logo.png" alt="CardioVision" className="w-11 h-11 relative z-10 object-contain" />
          </div>
          <div className="leading-tight text-left">
            <div className="text-sm font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
              CardioVision
            </div>
            <div className="text-[10px] text-indigo-300/50 font-medium tracking-[0.15em] uppercase mt-0.5">
              Cardiac AI
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
        <p className="text-[10px] font-bold tracking-[1.6px] text-white/20 uppercase px-3 pb-3">Menu</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ key, Icon, label }) => {
            const isActive = activeView === key
            const isLive   = key === 'new-analysis' && isAnalyzing
            return (
              <li key={key}>
                <button
                  onClick={() => onNavigate(key)}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                    'transition-all duration-200 group select-none',
                    isActive
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/90 border border-transparent',
                  ].join(' ')}
                >
                  {isLive
                    ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-orange-400" />
                    : <Icon className={['w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-300' : 'text-white/30 group-hover:text-white/70'].join(' ')} />
                  }
                  <span className="flex-1 text-left">{label}</span>
                  {isLive && (
                    <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #f97316, #ef4444)' }}>
                      LIVE
                    </span>
                  )}
                  {key === 'history' && jobCount > 0 && (
                    <span className="text-[10px] font-bold bg-indigo-500 text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {jobCount > 9 ? '9+' : jobCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Settings/Profile section */}
        <p className="text-[10px] font-bold tracking-[1.6px] text-white/20 uppercase px-3 pb-3 pt-5">Account</p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onNavigate('profile')}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 group select-none',
                activeView === 'profile'
                  ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/90 border border-transparent',
              ].join(' ')}
            >
              <Settings className={['w-4 h-4 flex-shrink-0', activeView === 'profile' ? 'text-indigo-300' : 'text-white/30 group-hover:text-white/70'].join(' ')} />
              <span className="flex-1 text-left">Profile & Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Doctor card + logout */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-white/10">
        {doctor ? (
          <div
            className="flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:bg-white/5 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => onNavigate('profile')}
            title="View profile"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              {doctor.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate leading-tight">{doctor.full_name}</div>
              <div className="text-[11px] text-white/40 truncate mt-0.5">{doctor.specialty || 'Cardiologist'}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleLogout() }}
              title="Sign out"
              className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
