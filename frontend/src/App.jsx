import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'

import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import AppSidebar from './components/layout/AppSidebar'
import AppHeader  from './components/layout/AppHeader'
import Dashboard   from './pages/Dashboard'
import NewAnalysis from './pages/NewAnalysis'
import HistoryPage from './pages/HistoryPage'
import ReportView  from './pages/ReportView'
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { listJobs, checkHealth, getReport } from './api/client'

// Ant Design token overrides (used by inner app components only)
const antdTheme = {
  token: {
    colorPrimary: '#6366f1',          // indigo-500 to match the new palette
    borderRadius: 8,
    borderRadiusLG: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13,
    colorBgContainer: '#ffffff',
    colorBorder: '#e8ecf4',
    colorBorderSecondary: '#f0f0f0',
    colorTextBase: '#1a1a2e',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    lineHeight: 1.57,
  },
  components: {
    Table: { headerBg: '#fafafa', borderColor: '#f0f0f0', rowHoverBg: '#f8faff', cellPaddingBlock: 11, cellPaddingInline: 14 },
    Card:  { paddingLG: 20, headerFontSize: 14 },
  },
}

const PAGE_TITLE = {
  'dashboard':    'Dashboard',
  'new-analysis': 'New Analysis',
  'history':      'Study History',
  'report':       'Analysis Report',
}

// ── Main app shell (authenticated) ────────────────────────────────────────────
function AppShell() {
  const { doctor } = useAuth()

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
    const jobs = await listJobs()
    setAllJobs(jobs)
    setIsAnalyzing(jobs.some(j => j.status === 'running' || j.status === 'queued'))
  }

  async function handleViewJobReport(jobId) {
    try {
      const rpt = await getReport(jobId)
      setPendingReport(rpt)
      setView('report')
    } catch { /* job not completed yet */ }
  }

  function handleNavigate(key) {
    setPendingReport(null)
    setView(key)
  }

  const activeNav = view === 'report' ? 'history' : view
  const pageTitle = view === 'new-analysis' && isAnalyzing ? 'Processing Analysis' : (PAGE_TITLE[view] || '')

  return (
    // Full-height flex layout: fixed sidebar on left, scrollable main on right
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#030712]">
      <AppSidebar
        activeView={activeNav}
        onNavigate={handleNavigate}
        jobCount={allJobs.length}
        isAnalyzing={isAnalyzing}
        doctor={doctor}
      />

      {/* Main column — offset by sidebar width (w-60 = 15rem = 240px) */}
      <div className="flex flex-col flex-1 ml-60 min-h-screen overflow-hidden">
        <AppHeader
          title={pageTitle}
          isAnalyzing={view === 'new-analysis' && isAnalyzing}
          apiOnline={apiOnline}
          doctor={doctor}
        />

        <main className="flex-1 p-6 overflow-auto">
          {view === 'dashboard'    && <Dashboard  jobs={allJobs} onNewAnalysis={() => handleNavigate('new-analysis')} onViewJob={handleViewJobReport} />}
          {view === 'new-analysis' && <NewAnalysis onJobsRefresh={loadJobs} onViewHistory={() => handleNavigate('history')} />}
          {view === 'history'      && <HistoryPage jobs={allJobs} onViewJob={handleViewJobReport} onNewAnalysis={() => handleNavigate('new-analysis')} />}
          {view === 'report' && pendingReport && (
            <ReportView report={pendingReport} onNewAnalysis={() => handleNavigate('new-analysis')} onViewHistory={() => handleNavigate('history')} />
          )}
        </main>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <AuthProvider>
          <Routes>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/app"      element={<PrivateRoute><AppShell /></PrivateRoute>} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  )
}
