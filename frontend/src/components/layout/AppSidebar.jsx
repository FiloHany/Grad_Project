import { Layout, Menu, Badge } from 'antd'
import {
  DashboardOutlined,
  PlusCircleOutlined,
  HistoryOutlined,
  LoadingOutlined,
  HeartOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

export default function AppSidebar({ activeView, onNavigate, jobCount, isAnalyzing }) {
  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'new-analysis',
      icon: isAnalyzing ? <LoadingOutlined spin /> : <PlusCircleOutlined />,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          New Analysis
          {isAnalyzing && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: 'linear-gradient(90deg, #fa8c16, #fa541c)',
              color: '#fff', borderRadius: 10,
              padding: '2px 7px', letterSpacing: 0.3,
            }}>
              LIVE
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          Study History
          {jobCount > 0 && (
            <Badge
              count={jobCount}
              size="small"
              className={isAnalyzing ? 'glow-badge' : ''}
              style={{ backgroundColor: '#1677ff' }}
            />
          )}
        </span>
      ),
    },
  ]

  return (
    <Sider
      width={240}
      style={{
        position: 'fixed',
        height: '100vh',
        left: 0, top: 0,
        zIndex: 100,
        background: 'linear-gradient(180deg, #0d1f3c 0%, #0a1628 60%, #061020 100%)',
        boxShadow: '2px 0 16px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'linear-gradient(135deg, #1677ff 0%, #003eb3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(22,119,255,0.4)',
          }}>
            <HeartOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15.5, letterSpacing: 0.1 }}>
              CardioVision
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 1, letterSpacing: 1 }}>
              CARDIAC ANALYSIS
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        <div className="nav-section-label">Menu</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeView]}
          onClick={({ key }) => onNavigate(key)}
          items={items}
          style={{ background: 'transparent', border: 'none' }}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8, padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#52c41a',
            boxShadow: '0 0 6px rgba(82,196,26,0.8)',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}>
              System Online
            </div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>v1.0.0</div>
          </div>
        </div>
      </div>
    </Sider>
  )
}
