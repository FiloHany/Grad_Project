import { useMemo } from 'react'
import { Card, Tag, Empty, Button } from 'antd'
import { ArrowLeftOutlined, RightOutlined } from '@ant-design/icons'
import { Activity, Heart, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { fmtDate, diagTagColor } from '../constants'

export default function PatientDetailPage({ patient, jobs, onBack, onViewJob }) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const cardBg     = isDark ? '#0f172a' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0'
  const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)'
  const textMain   = isDark ? '#f1f5f9' : '#0f172a'
  const textSub    = isDark ? '#64748b' : '#94a3b8'
  const rowHover   = isDark ? 'rgba(99,102,241,0.07)' : '#f8f7ff'

  // Filter jobs belonging to this patient
  const patientJobs = useMemo(() => {
    return [...jobs]
      .filter(j => {
        if (patient.id) return j.patient_id === patient.id
        if (patient.name !== 'Anonymous') return j.patient_name === patient.name
        return !j.patient_id && !j.patient_name
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [jobs, patient])

  const completed  = patientJobs.filter(j => j.status === 'completed')
  const efVals     = completed.filter(j => j.measurements?.ef_final != null).map(j => j.measurements.ef_final)
  const avgEF      = efVals.length ? (efVals.reduce((a, b) => a + b, 0) / efVals.length).toFixed(1) : null
  const lastDiag   = completed[0]?.measurements?.diagnosis || null
  const minEF      = efVals.length ? Math.min(...efVals).toFixed(1) : null
  const maxEF      = efVals.length ? Math.max(...efVals).toFixed(1) : null

  function statusIcon(status) {
    if (status === 'completed') return <CheckCircle size={14} color="#22c55e" />
    if (status === 'running')   return <Clock size={14} color="#f59e0b" />
    if (status === 'failed')    return <AlertTriangle size={14} color="#ef4444" />
    return <Clock size={14} color="#94a3b8" />
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            border: `1px solid ${cardBorder}`,
            color: textSub, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.color = textSub }}
        >
          <ArrowLeftOutlined style={{ fontSize: 11 }} /> Back to Patients
        </button>

        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: textMain, lineHeight: 1 }}>
            {patient.name}
          </div>
          {patient.id && (
            <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>Patient ID: {patient.id}</div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Studies',   value: patientJobs.length,  color: '#818cf8', icon: Activity  },
          { label: 'Completed',       value: completed.length,    color: '#4ade80', icon: CheckCircle },
          { label: 'Avg EF',          value: avgEF ? `${avgEF}%` : '—', color: '#f472b6', icon: Heart },
          { label: 'EF Range',        value: minEF ? `${minEF}–${maxEF}%` : '—', color: '#fb923c', icon: Activity },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            flex: 1, background: cardBg, border: `1px solid ${cardBorder}`,
            borderTop: `3px solid ${color}`, borderRadius: 12, padding: '16px 20px',
            boxShadow: cardShadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon size={13} color={color} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
          </div>
        ))}
        {lastDiag && (
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderTop: `3px solid #a78bfa`, borderRadius: 12, padding: '16px 20px',
            boxShadow: cardShadow, minWidth: 130,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 8 }}>
              Latest Dx
            </div>
            <Tag color={diagTagColor(lastDiag)} style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '2px 10px' }}>
              {lastDiag}
            </Tag>
          </div>
        )}
      </div>

      {/* Study list */}
      <Card
        bordered={false}
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 14,
          boxShadow: cardShadow,
        }}
        bodyStyle={{ padding: 0 }}
        title={
          <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 700, color: textMain }}>All Studies</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#fff', background: '#6366f1',
              borderRadius: 20, padding: '1px 8px', marginLeft: 4,
            }}>
              {patientJobs.length}
            </span>
          </div>
        }
      >
        {patientJobs.length === 0 ? (
          <div style={{ padding: '40px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: textSub, fontSize: 13 }}>No studies for this patient</span>}
            />
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {patientJobs.map((job, idx) => {
              const ef   = job.measurements?.ef_final
              const diag = job.measurements?.diagnosis

              return (
                <div
                  key={job.job_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 20px',
                    borderBottom: idx < patientJobs.length - 1 ? `1px solid ${cardBorder}` : 'none',
                    cursor: job.status === 'completed' ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (job.status === 'completed') e.currentTarget.style.background = rowHover }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  onClick={() => job.status === 'completed' && onViewJob(job.job_id)}
                >
                  {/* Index bubble */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: isDark ? 'rgba(99,102,241,0.15)' : '#ede9fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#6366f1',
                  }}>
                    {patientJobs.length - idx}
                  </div>

                  {/* Date + status */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textMain, marginBottom: 2 }}>
                      {fmtDate(job.created_at).split('·')[0].trim()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {statusIcon(job.status)}
                      <span style={{ fontSize: 11, color: textSub, textTransform: 'capitalize' }}>{job.status}</span>
                    </div>
                  </div>

                  {/* EF value */}
                  {ef != null ? (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>
                        {ef.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 10, color: textSub, marginTop: 1 }}>EF</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: textSub, flexShrink: 0 }}>—</div>
                  )}

                  {/* Diagnosis tag */}
                  {diag ? (
                    <Tag
                      color={diagTagColor(diag)}
                      style={{ fontSize: 11, borderRadius: 20, padding: '1px 10px', flexShrink: 0 }}
                    >
                      {diag}
                    </Tag>
                  ) : (
                    <div style={{ width: 80 }} />
                  )}

                  {/* Arrow */}
                  {job.status === 'completed' ? (
                    <RightOutlined style={{ color: textSub, fontSize: 11, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 12 }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
