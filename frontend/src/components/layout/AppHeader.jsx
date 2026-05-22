import { Tag, Space, Tooltip } from 'antd'
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

export default function AppHeader({ title, isAnalyzing, apiOnline }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: -0.1 }}>{title}</span>
        {isAnalyzing && (
          <Tag icon={<SyncOutlined spin />} color="processing" style={{ fontSize: 11, fontWeight: 600 }}>
            Processing
          </Tag>
        )}
      </div>

      <Space size={10} align="center">
        <span style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 500 }}>{today}</span>
        <div style={{ width: 1, height: 16, background: '#e8ecf4' }} />
        <Tooltip title={apiOnline ? 'All systems operational' : 'Backend unreachable'}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: apiOnline ? 'rgba(82,196,26,0.08)' : 'rgba(255,77,79,0.08)',
            border: `1px solid ${apiOnline ? 'rgba(82,196,26,0.25)' : 'rgba(255,77,79,0.25)'}`,
            cursor: 'default',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: apiOnline ? '#52c41a' : '#ff4d4f',
              boxShadow: apiOnline
                ? '0 0 5px rgba(82,196,26,0.7)'
                : '0 0 5px rgba(255,77,79,0.7)',
            }} />
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: apiOnline ? '#389e0d' : '#cf1322',
              letterSpacing: 0.2,
            }}>
              {apiOnline === null ? 'Checking…' : apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </Tooltip>
      </Space>
    </div>
  )
}
