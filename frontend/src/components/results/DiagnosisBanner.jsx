import { DIAG_CONFIG } from '../../constants'
import { CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons'

const SEVERITY_LEVELS = [
  { key: 'Normal',                color: '#52c41a', label: 'Normal' },
  { key: 'Mild Hypokinesia',      color: '#a0d911', label: 'Mild' },
  { key: 'Moderate Hypokinesia',  color: '#faad14', label: 'Moderate' },
  { key: 'Severe Hypokinesia',    color: '#fa8c16', label: 'Severe' },
  { key: 'Akinesia',              color: '#ff4d4f', label: 'Critical' },
]

function SeverityIcon({ diagnosis }) {
  if (diagnosis === 'Normal') return <CheckCircleFilled style={{ fontSize: 22, color: '#52c41a' }} />
  if (diagnosis?.includes('Mild')) return <WarningFilled style={{ fontSize: 22, color: '#a0d911' }} />
  if (diagnosis?.includes('Moderate')) return <WarningFilled style={{ fontSize: 22, color: '#faad14' }} />
  if (diagnosis?.includes('Severe')) return <WarningFilled style={{ fontSize: 22, color: '#fa8c16' }} />
  return <CloseCircleFilled style={{ fontSize: 22, color: '#ff4d4f' }} />
}

function EFGauge({ value }) {
  if (value == null) return null
  const pct = Math.min(100, Math.max(0, value))
  const color = value >= 55 ? '#52c41a' : value >= 45 ? '#a0d911' : value >= 35 ? '#faad14' : value >= 25 ? '#fa8c16' : '#ff4d4f'
  return (
    <div style={{ position: 'relative', marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>0%</span>
        <span style={{ fontSize: 10, color: '#52c41a', fontWeight: 600 }}>Normal ≥55%</span>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>100%</span>
      </div>
      <div style={{ height: 8, background: 'linear-gradient(90deg,#ff4d4f,#fa8c16,#faad14,#a0d911,#52c41a)', borderRadius: 4, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -4, left: `calc(${pct}% - 8px)`,
          width: 16, height: 16, borderRadius: '50%',
          background: color, border: '2px solid #fff',
          boxShadow: `0 2px 8px ${color}80`,
          transition: 'left 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#ff4d4f' }}>Critical</span>
        <span style={{ fontSize: 10, color: color, fontWeight: 600 }}>{value.toFixed(1)}% EF</span>
        <span style={{ fontSize: 10, color: '#52c41a' }}>Optimal</span>
      </div>
    </div>
  )
}

export default function DiagnosisBanner({ diagnosis, efFinal }) {
  const cfg = DIAG_CONFIG[diagnosis] || DIAG_CONFIG['Normal']
  const activeIdx = SEVERITY_LEVELS.findIndex(s => s.key === diagnosis)

  return (
    <div
      className="diag-banner fade-in-up"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `5px solid ${cfg.leftBar}`,
        borderRadius: 12,
        padding: '22px 28px',
        marginBottom: 22,
        boxShadow: `0 2px 12px ${cfg.leftBar}20`,
      }}
    >
      {/* Top row: icon + title + EF value */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: cfg.leftBar, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
            boxShadow: `0 4px 14px ${cfg.leftBar}50`,
          }} className="diag-icon-pulse">
            <SeverityIcon diagnosis={diagnosis} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#111827', lineHeight: 1.2, letterSpacing: -0.3 }}>
              {cfg.title}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
              {cfg.subtitle}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', paddingLeft: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
            Ejection Fraction
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, color: cfg.color, lineHeight: 1, letterSpacing: -2 }}>
            {efFinal != null ? `${efFinal.toFixed(1)}` : '—'}
            {efFinal != null && <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 0 }}>%</span>}
          </div>
        </div>
      </div>

      {/* Severity scale */}
      <div style={{ marginTop: 18, borderTop: `1px solid ${cfg.border}`, paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Severity Scale
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.leftBar}18`, padding: '2px 10px', borderRadius: 20 }}>
            {diagnosis || 'Unknown'}
          </span>
        </div>
        <div className="severity-scale">
          {SEVERITY_LEVELS.map((s, i) => (
            <div
              key={s.key}
              className={`severity-block ${i === activeIdx ? '' : 'inactive'}`}
              style={{ background: s.color }}
              title={s.label}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          {SEVERITY_LEVELS.map((s, i) => (
            <span key={s.key} style={{
              fontSize: 9.5, fontWeight: i === activeIdx ? 700 : 400,
              color: i === activeIdx ? s.color : '#c0c7d0',
              letterSpacing: 0.2,
            }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* EF gauge */}
      {efFinal != null && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${cfg.border}`, paddingTop: 12 }}>
          <EFGauge value={efFinal} />
        </div>
      )}
    </div>
  )
}
