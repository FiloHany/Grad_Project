import { DIAG_CONFIG } from '../../constants'
import { CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'

const SEVERITY_LEVELS = [
  { key: 'Normal',               color: '#22c55e', label: 'Normal',   pct: 15  },
  { key: 'Mild Dysfunction',     color: '#a3e635', label: 'Mild',     pct: 38  },
  { key: 'Moderate Dysfunction', color: '#f59e0b', label: 'Moderate', pct: 63  },
  { key: 'Severe Dysfunction',   color: '#ef4444', label: 'Severe',   pct: 88  },
]

const DIAG_DARK = {
  'Normal':               { bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.2)',   glow: 'rgba(34,197,94,0.15)'  },
  'Mild Dysfunction':     { bg: 'rgba(163,230,53,0.06)',  border: 'rgba(163,230,53,0.2)',  glow: 'rgba(163,230,53,0.12)' },
  'Moderate Dysfunction': { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)',  glow: 'rgba(245,158,11,0.12)' },
  'Severe Dysfunction':   { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',   glow: 'rgba(239,68,68,0.15)'  },
}
const DIAG_LIGHT = {
  'Normal':               { bg: '#f0fdf4', border: '#bbf7d0', glow: 'rgba(34,197,94,0.1)'   },
  'Mild Dysfunction':     { bg: '#f7fee7', border: '#d9f99d', glow: 'rgba(163,230,53,0.1)'  },
  'Moderate Dysfunction': { bg: '#fffbeb', border: '#fde68a', glow: 'rgba(245,158,11,0.1)'  },
  'Severe Dysfunction':   { bg: '#fef2f2', border: '#fecaca', glow: 'rgba(239,68,68,0.1)'   },
}

function SeverityIcon({ diagnosis, size = 24 }) {
  const s = { fontSize: size }
  if (diagnosis === 'Normal')               return <CheckCircleFilled style={{ ...s, color: '#22c55e' }} />
  if (diagnosis === 'Mild Dysfunction')     return <WarningFilled     style={{ ...s, color: '#a3e635' }} />
  if (diagnosis === 'Moderate Dysfunction') return <WarningFilled     style={{ ...s, color: '#f59e0b' }} />
  return <CloseCircleFilled style={{ ...s, color: '#ef4444' }} />
}

function EFGauge({ value, color }) {
  if (value == null) return null
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10.5, color: '#64748b' }}>
        <span>0%</span>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>Normal threshold ≥ 55%</span>
        <span>100%</span>
      </div>
      <div style={{
        height: 10, borderRadius: 5,
        background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 25%, #a3e635 50%, #22c55e 75%, #16a34a 100%)',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute', top: '50%',
          left: `calc(${pct}% - 10px)`,
          transform: 'translateY(-50%)',
          width: 20, height: 20, borderRadius: '50%',
          background: color,
          border: '3px solid #fff',
          boxShadow: `0 2px 12px ${color}90, 0 0 0 3px ${color}30`,
          transition: 'left 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 2,
        }} />
        {/* Normal threshold marker */}
        <div style={{
          position: 'absolute', top: -4, left: '55%',
          width: 2, height: 18, background: 'rgba(255,255,255,0.6)',
          borderRadius: 1,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5 }}>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>Critical</span>
        <span style={{ color, fontWeight: 800, fontSize: 13 }}>{value.toFixed(1)}% EF</span>
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Optimal</span>
      </div>
    </div>
  )
}

export default function DiagnosisBanner({ diagnosis, efFinal }) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const cfg     = DIAG_CONFIG[diagnosis] || DIAG_CONFIG['Normal']
  const palette = (isDark ? DIAG_DARK : DIAG_LIGHT)[diagnosis] || (isDark ? DIAG_DARK : DIAG_LIGHT)['Normal']
  const activeIdx = SEVERITY_LEVELS.findIndex(s => s.key === diagnosis)
  const activeSev = SEVERITY_LEVELS[activeIdx] || SEVERITY_LEVELS[0]

  const titleColor    = isDark ? '#f8fafc' : '#0f172a'
  const subtitleColor = isDark ? '#94a3b8'  : '#475569'
  const dividerColor  = isDark ? palette.border : palette.border

  return (
    <div
      className="diag-banner fade-in-up"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 22,
        boxShadow: `0 8px 32px ${palette.glow}, 0 1px 3px rgba(0,0,0,0.1)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute', right: -60, top: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: `${activeSev.color}08`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 80, bottom: -80,
        width: 160, height: 160, borderRadius: '50%',
        background: `${activeSev.color}05`,
        pointerEvents: 'none',
      }} />

      {/* ── Top row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>

        {/* Left: icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
          {/* Animated icon badge */}
          <div
            className="diag-icon-pulse"
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${activeSev.color}30, ${activeSev.color}15)`,
              border: `1.5px solid ${activeSev.color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 24px ${activeSev.color}25`,
            }}
          >
            <SeverityIcon diagnosis={diagnosis} size={28} />
          </div>

          <div>
            <div style={{
              fontSize: 21, fontWeight: 800, color: titleColor,
              lineHeight: 1.2, letterSpacing: -0.4, marginBottom: 6,
            }}>
              {cfg.title}
            </div>
            <div style={{ fontSize: 13.5, color: subtitleColor, lineHeight: 1.6, maxWidth: 460 }}>
              {cfg.subtitle}
            </div>
          </div>
        </div>

        {/* Right: EF value badge */}
        <div style={{
          textAlign: 'center',
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
          border: `1.5px solid ${palette.border}`,
          borderRadius: 14,
          padding: '14px 24px',
          flexShrink: 0,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
            Ejection Fraction
          </div>
          <div style={{
            fontSize: 52, fontWeight: 900, color: activeSev.color,
            lineHeight: 1, letterSpacing: -3,
            textShadow: `0 0 30px ${activeSev.color}50`,
          }}>
            {efFinal != null ? efFinal.toFixed(1) : '—'}
            {efFinal != null && (
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 0 }}>%</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Severity scale ── */}
      <div style={{ borderTop: `1px solid ${dividerColor}`, paddingTop: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Severity Classification
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: activeSev.color,
            background: `${activeSev.color}18`,
            border: `1px solid ${activeSev.color}35`,
            padding: '3px 12px', borderRadius: 20,
          }}>
            {diagnosis || 'Unknown'}
          </span>
        </div>

        {/* Segmented severity bar */}
        <div style={{ display: 'flex', gap: 4, height: 8 }}>
          {SEVERITY_LEVELS.map((s, i) => (
            <div
              key={s.key}
              style={{
                flex: 1,
                height: '100%',
                borderRadius: 4,
                background: s.color,
                opacity: i === activeIdx ? 1 : 0.18,
                transition: 'opacity 0.3s',
                boxShadow: i === activeIdx ? `0 0 8px ${s.color}80` : 'none',
              }}
              title={s.label}
            />
          ))}
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', marginTop: 6 }}>
          {SEVERITY_LEVELS.map((s, i) => (
            <div key={s.key} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{
                fontSize: 10, fontWeight: i === activeIdx ? 800 : 400,
                color: i === activeIdx ? s.color : (isDark ? '#334155' : '#cbd5e1'),
                letterSpacing: 0.2,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── EF Gauge ── */}
      {efFinal != null && (
        <div style={{ borderTop: `1px solid ${dividerColor}`, paddingTop: 16 }}>
          <EFGauge value={efFinal} color={activeSev.color} />
        </div>
      )}
    </div>
  )
}
