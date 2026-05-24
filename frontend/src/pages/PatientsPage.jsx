import { useMemo } from 'react'
import { Card, Empty, Tag } from 'antd'
import { PlusOutlined, RightOutlined } from '@ant-design/icons'
import { Users, Activity, Heart } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { fmtDate, diagTagColor } from '../constants'

export default function PatientsPage({ jobs, onNewAnalysis, onViewPatient }) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const cardBg     = isDark ? '#0f172a' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0'
  const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)'
  const textMain   = isDark ? '#f1f5f9' : '#0f172a'
  const textSub    = isDark ? '#64748b' : '#94a3b8'

  // Group jobs by patient identity
  const patients = useMemo(() => {
    const map = new Map()
    jobs.forEach(j => {
      // Key: patient_id if present, else patient_name, else 'Anonymous'
      const key = j.patient_id
        ? `id:${j.patient_id}`
        : j.patient_name
          ? `name:${j.patient_name}`
          : 'anon'

      const entry = map.get(key) || {
        key,
        name:    j.patient_name || 'Anonymous',
        id:      j.patient_id   || null,
        jobs:    [],
      }
      entry.jobs.push(j)
      map.set(key, entry)
    })

    return Array.from(map.values())
      .map(p => {
        const sorted = [...p.jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        const completed = sorted.filter(j => j.status === 'completed')
        const efVals    = completed.filter(j => j.measurements?.ef_final != null).map(j => j.measurements.ef_final)
        const avgEF     = efVals.length ? (efVals.reduce((a, b) => a + b, 0) / efVals.length).toFixed(1) : null
        const lastDiag  = completed[0]?.measurements?.diagnosis || null
        return {
          ...p,
          sortedJobs: sorted,
          lastStudy:  sorted[0]?.created_at,
          total:      sorted.length,
          completed:  completed.length,
          avgEF,
          lastDiag,
        }
      })
      .sort((a, b) => new Date(b.lastStudy || 0) - new Date(a.lastStudy || 0))
  }, [jobs])

  if (jobs.length === 0) {
    return (
      <div className="fade-in-up">
        <PageHeader textMain={textMain} textSub={textSub} count={0} />
        <Card bordered={false} style={{ borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: textMain, marginBottom: 6 }}>No patients yet</div>
                <div style={{ fontSize: 13, color: textSub }}>Run your first analysis to add a patient.</div>
              </div>
            }
            style={{ padding: '60px 0' }}
          >
            <button
              onClick={onNewAnalysis}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              <PlusOutlined /> Start First Analysis
            </button>
          </Empty>
        </Card>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      <PageHeader textMain={textMain} textSub={textSub} count={patients.length} onNewAnalysis={onNewAnalysis} />

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Patients', value: patients.length, color: '#818cf8', icon: Users },
          { label: 'Total Studies',  value: jobs.length,     color: '#4ade80', icon: Activity },
          { label: 'With Results',   value: jobs.filter(j => j.status === 'completed').length, color: '#f472b6', icon: Heart },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            flex: 1, background: cardBg, border: `1px solid ${cardBorder}`,
            borderTop: `3px solid ${color}`, borderRadius: 12, padding: '16px 20px',
            boxShadow: cardShadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Patient cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {patients.map(p => (
          <button
            key={p.key}
            onClick={() => onViewPatient(p)}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: cardShadow,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'block',
              width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = `0 8px 32px ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.boxShadow = cardShadow }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800, color: '#fff',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}>
                {p.name !== 'Anonymous' ? p.name.charAt(0).toUpperCase() : '?'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: textMain, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                {p.id && (
                  <div style={{ fontSize: 11, color: textSub }}>ID: {p.id}</div>
                )}
              </div>

              <RightOutlined style={{ color: textSub, fontSize: 12, marginTop: 4, flexShrink: 0 }} />
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${cardBorder}` }}>
              <Stat label="Studies"   value={p.total}     color={textSub} textMain={textMain} />
              <Stat label="Completed" value={p.completed} color="#4ade80" textMain="#4ade80" />
              {p.avgEF && (
                <Stat label="Avg EF" value={`${p.avgEF}%`} color="#818cf8" textMain="#818cf8" />
              )}
              {p.lastDiag && (
                <div style={{ marginLeft: 'auto', marginTop: -2 }}>
                  <Tag color={diagTagColor(p.lastDiag)} style={{ fontSize: 10, borderRadius: 20, padding: '0 8px' }}>
                    {p.lastDiag}
                  </Tag>
                </div>
              )}
            </div>

            {/* Last study */}
            {p.lastStudy && (
              <div style={{ marginTop: 10, fontSize: 11, color: textSub }}>
                Last study: {fmtDate(p.lastStudy).split('·')[0].trim()}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function PageHeader({ textMain, textSub, count, onNewAnalysis }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: textMain, marginBottom: 2 }}>Patients</div>
        <div style={{ fontSize: 13, color: textSub }}>{count} patient{count !== 1 ? 's' : ''} in the system</div>
      </div>
      {onNewAnalysis && (
        <button
          onClick={onNewAnalysis}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          <PlusOutlined /> New Analysis
        </button>
      )}
    </div>
  )
}

function Stat({ label, value, textMain }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: textMain, lineHeight: 1 }}>{value}</div>
    </div>
  )
}
