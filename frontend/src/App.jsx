import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout, ConfigProvider, App as AntApp } from 'antd'

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

const { Header, Content } = Layout

const antdTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    borderRadiusLG: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13,
    colorBgLayout: '#f0f2f5',
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
    Layout: { siderBg: '#0a1628', headerBg: '#ffffff', bodyBg: '#f0f2f5' },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(22,119,255,0.18)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      darkItemSelectedColor: '#40a9ff',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemHoverColor: '#ffffff',
      itemHeight: 40,
    },
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

// ── Main app shell (shown once authenticated) ─────────────────────────────────
function AppShell() {
  const navigate = useNavigate()
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
    } catch { /* job not completed */ }
  }

  function handleNavigate(key) {
    setPendingReport(null)
    setView(key)
  }

  const activeNav = view === 'report' ? 'history' : view
  const pageTitle = view === 'new-analysis' && isAnalyzing ? 'Processing Analysis' : PAGE_TITLE[view] || ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar
        activeView={activeNav}
        onNavigate={handleNavigate}
        jobCount={allJobs.length}
        isAnalyzing={isAnalyzing}
        doctor={doctor}
      />
      <Layout style={{ marginLeft: 240 }}>
        <Header style={{
          padding: '0 24px', background: '#ffffff',
          borderBottom: '1px solid #f0f0f0', height: 56, lineHeight: '56px',
          position: 'sticky', top: 0, zIndex: 99,
          boxShadow: '0 1px 6px rgba(0,21,41,0.07)',
        }}>
          <AppHeader
            title={pageTitle}
            isAnalyzing={view === 'new-analysis' && isAnalyzing}
            apiOnline={apiOnline}
            doctor={doctor}
          />
        </Header>

        <Content style={{ padding: 26, background: '#f0f2f5', minHeight: 'calc(100vh - 56px)' }}>
          {view === 'dashboard'    && <Dashboard  jobs={allJobs} onNewAnalysis={() => handleNavigate('new-analysis')} onViewJob={handleViewJobReport} />}
          {view === 'new-analysis' && <NewAnalysis onJobsRefresh={loadJobs} onViewHistory={() => handleNavigate('history')} />}
          {view === 'history'      && <HistoryPage jobs={allJobs} onViewJob={handleViewJobReport} onNewAnalysis={() => handleNavigate('new-analysis')} />}
          {view === 'report' && pendingReport && (
            <ReportView report={pendingReport} onNewAnalysis={() => handleNavigate('new-analysis')} onViewHistory={() => handleNavigate('history')} />
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

// ── Root: providers + routes ──────────────────────────────────────────────────
export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <AuthProvider>
          <Routes>
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/app"       element={<PrivateRoute><AppShell /></PrivateRoute>} />
            {/* Redirect any unknown path to landing */}
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  )
}
