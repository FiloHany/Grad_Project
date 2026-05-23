import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp, theme as antTheme } from 'antd'

import { useTheme }   from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute   from './components/auth/PrivateRoute'
import AppSidebar     from './components/layout/AppSidebar'
import AppHeader      from './components/layout/AppHeader'
import Dashboard      from './pages/Dashboard'
import NewAnalysis    from './pages/NewAnalysis'
import HistoryPage    from './pages/HistoryPage'
import ReportView     from './pages/ReportView'
import ProfilePage    from './pages/ProfilePage'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import { listJobs, checkHealth, getReport } from './api/client'

const { darkAlgorithm, defaultAlgorithm } = antTheme

const PAGE_TITLE = {
  dashboard:    'Dashboard',
  'new-analysis': 'New Analysis',
  history:      'Study History',
  report:       'Analysis Report',
  profile:      'My Profile',
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { doctor } = useAuth()
  const { theme }  = useTheme()

  const [view,          setView]          = useState('dashboard')
  const [allJobs,       setAllJobs]       = useState([])
  const [apiOnline,     setApiOnline]     = useState(null)
  const [isAnalyzing,   setIsAnalyzing]   = useState(false)
  const [pendingReport, setPendingReport] = useState(null)

  useEffect(() => {
    loadJobs()
    checkHealth().then(setApiOnline)
    const iv = setInterval(loadJobs, 8000)
    return () => clearInterval(iv)
  }, [])

  async function loadJobs() {
    try {
      const jobs = await listJobs()
      setAllJobs(jobs)
      setIsAnalyzing(jobs.some(j => j.status === 'running' || j.status === 'queued'))
    } catch { /* silently ignore */ }
  }

  async function handleViewJobReport(jobId) {
    try {
      const rpt = await getReport(jobId)
      setPendingReport(rpt)
      setView('report')
    } catch { /* not ready */ }
  }

  function handleNavigate(key) {
    setPendingReport(null)
    setView(key)
  }

  const isDark    = theme === 'dark'
  const activeNav = view === 'report' ? 'history' : view
  const pageTitle = view === 'new-analysis' && isAnalyzing ? 'Processing Analysis' : (PAGE_TITLE[view] || '')

  // Sync Ant Design algorithm with current theme
  const antConfig = {
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary:  '#6366f1',
      borderRadius:  8,
      borderRadiusLG: 10,
      fontFamily:    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize:      13,
      lineHeight:    1.57,
      // Light-mode overrides only — dark algorithm handles dark colours
      ...(isDark ? {} : {
        colorBgContainer:  '#ffffff',
        colorBgLayout:     '#f0f2f5',
        colorBorder:       '#e8ecf4',
        colorBorderSecondary: '#f0f0f0',
        colorTextBase:     '#1a1a2e',
        colorTextSecondary:'#6b7280',
        colorTextTertiary: '#9ca3af',
      }),
    },
    components: {
      Table: { cellPaddingBlock: 11, cellPaddingInline: 14 },
      Card:  { paddingLG: 20, headerFontSize: 14 },
    },
  }

  // Background colours that match Ant Design's dark/light layout colours
  const bgMain    = isDark ? '#0f0f1a' : '#f0f2f5'
  const bgContent = isDark ? '#141414' : '#f0f2f5'

  return (
    <ConfigProvider theme={antConfig}>
      <AntApp>
        <div className="flex min-h-screen" style={{ background: bgMain }}>
          <AppSidebar
            activeView={activeNav}
            onNavigate={handleNavigate}
            jobCount={allJobs.length}
            isAnalyzing={isAnalyzing}
            doctor={doctor}
          />
          <div className="flex flex-col flex-1 ml-60 min-h-screen overflow-hidden">
            <AppHeader
              title={pageTitle}
              isAnalyzing={view === 'new-analysis' && isAnalyzing}
              apiOnline={apiOnline}
              doctor={doctor}
              onProfileClick={() => handleNavigate('profile')}
            />
            <main className="flex-1 p-6 overflow-auto" style={{ background: bgContent }}>
              {view === 'dashboard'    && <Dashboard  jobs={allJobs} onNewAnalysis={() => handleNavigate('new-analysis')} onViewJob={handleViewJobReport} />}
              {view === 'new-analysis' && <NewAnalysis onJobsRefresh={loadJobs} onViewHistory={() => handleNavigate('history')} />}
              {view === 'history'      && <HistoryPage jobs={allJobs} onViewJob={handleViewJobReport} onNewAnalysis={() => handleNavigate('new-analysis')} />}
              {view === 'profile'      && <ProfilePage jobs={allJobs} onNavigate={handleNavigate} />}
              {view === 'report' && pendingReport && (
                <ReportView report={pendingReport} onNewAnalysis={() => handleNavigate('new-analysis')} onViewHistory={() => handleNavigate('history')} />
              )}
            </main>
          </div>
        </div>
      </AntApp>
    </ConfigProvider>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app"      element={<PrivateRoute><AppShell /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
