import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'

const METRICS = [
  {
    key: 'ef_final',
    label: 'Ejection Fraction',
    unit: '%',
    color: '#818cf8',       // indigo-400
    colorDark: '#6366f1',
    normal: { min: 55, max: 75, abs_min: 0, abs_max: 100 },
    hint: 'Final ensemble EF (biplane Simpson + CNN model average)',
    normalText: '≥ 55%',
    icon: '♥',
  },
  {
    key: 'edv_ml',
    label: 'End-Diastolic Vol.',
    unit: 'mL',
    color: '#a78bfa',       // violet-400
    colorDark: '#8b5cf6',
    normal: { min: 65, max: 195, abs_min: 0, abs_max: 300 },
    hint: 'Maximum LV volume at end of filling (diastole)',
    normalText: '65–195 mL',
    icon: '◉',
  },
  {
    key: 'esv_ml',
    label: 'End-Systolic Vol.',
    unit: 'mL',
    color: '#f472b6',       // pink-400
    colorDark: '#ec4899',
    normal: { min: 16, max: 80, abs_min: 0, abs_max: 200 },
    hint: 'Minimum LV volume at end of contraction (systole)',
    normalText: '16–80 mL',
    icon: '◎',
  },
  {
    key: 'sv_ml',
    label: 'Stroke Volume',
    unit: 'mL',
    color: '#34d399',       // emerald-400
    colorDark: '#10b981',
    normal: { min: 50, max: 120, abs_min: 0, abs_max: 200 },
    hint: 'Volume ejected per heartbeat: EDV − ESV',
    normalText: '50–120 mL',
    icon: '⤴',
  },
]

function RangeBar({ value, normal, color, isDark }) {
  if (value == null) return null
  const { min, max, abs_min, abs_max } = normal
  const range     = abs_max - abs_min
  const fillPct   = Math.min(100, Math.max(0, ((value - abs_min) / range) * 100))
  const normStart = ((min - abs_min) / range) * 100
  const normEnd   = ((max - abs_min) / range) * 100
  const isNormal  = value >= min && value <= max
  const barColor  = isNormal ? color : (value < min ? '#f59e0b' : '#ef4444')
  const trackBg   = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'
  const zoneBg    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(34,197,94,0.12)'

  return (
    <div style={{ marginTop: 12 }}>
      {/* Track */}
      <div style={{ height: 5, background: trackBg, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        {/* Normal zone */}
        <div style={{
          position: 'absolute', top: 0, height: '100%',
          left: `${normStart}%`, width: `${normEnd - normStart}%`,
          background: zoneBg, borderRadius: 3,
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${fillPct}%`,
          background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
          borderRadius: 3,
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      {/* Thumb */}
      <div style={{ position: 'relative', height: 0 }}>
        <div style={{
          position: 'absolute', top: -9, left: `calc(${fillPct}% - 6px)`,
          width: 12, height: 12, borderRadius: '50%',
          background: barColor,
          border: `2px solid ${isDark ? '#0f172a' : '#fff'}`,
          boxShadow: `0 0 8px ${barColor}80`,
          transition: 'left 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      {/* Range label */}
      <div style={{
        marginTop: 10, display: 'flex', justifyContent: 'space-between',
        fontSize: 10, color: isDark ? '#475569' : '#94a3b8',
      }}>
        <span>{normal.abs_min}{''}</span>
        <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 600 }}>
          Normal: {normStart.toFixed(0)}–{normEnd.toFixed(0)}%
        </span>
        <span>{normal.abs_max}{''}</span>
      </div>
    </div>
  )
}

export default function MetricsGrid({ measurements }) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const cardBg    = isDark ? '#0f172a' : '#ffffff'
  const border    = isDark ? '#1e293b' : '#e2e8f0'
  const textSub   = isDark ? '#64748b' : '#94a3b8'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
      {METRICS.map(m => {
        const val      = measurements[m.key]
        const isNormal = val != null && val >= m.normal.min && val <= m.normal.max
        const accent   = isDark ? m.color : m.colorDark

        return (
          <div
            key={m.key}
            className="metric-card"
            style={{
              borderRadius: 14,
              background: cardBg,
              border: `1px solid ${border}`,
              borderTop: `3px solid ${accent}`,
              padding: '18px 20px 16px',
              boxShadow: isDark
                ? `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${border}`
                : '0 4px 16px rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative glow blob */}
            <div style={{
              position: 'absolute', right: -24, top: -24,
              width: 80, height: 80, borderRadius: '50%',
              background: `${accent}18`,
              pointerEvents: 'none',
            }} />

            {/* Label row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1,
                textTransform: 'uppercase', color: accent,
              }}>
                {m.label}
              </span>
              <Tooltip title={m.hint}>
                <InfoCircleOutlined style={{ fontSize: 11, color: textSub, cursor: 'pointer' }} />
              </Tooltip>
            </div>

            {/* Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
              <span style={{
                fontSize: 40, fontWeight: 900, color: accent,
                lineHeight: 1, letterSpacing: -2,
                textShadow: isDark ? `0 0 20px ${accent}40` : 'none',
              }}>
                {val != null ? val.toFixed(1) : '—'}
              </span>
              {val != null && (
                <span style={{ fontSize: 15, fontWeight: 600, color: textSub }}>{m.unit}</span>
              )}
            </div>

            {/* Status badge */}
            {val != null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 10.5, fontWeight: 700,
                padding: '4px 10px', borderRadius: 20,
                background: isNormal
                  ? (isDark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)')
                  : (isDark ? 'rgba(251,191,36,0.12)' : 'rgba(245,158,11,0.08)'),
                color: isNormal
                  ? (isDark ? '#4ade80' : '#16a34a')
                  : (isDark ? '#fbbf24' : '#d97706'),
                border: `1px solid ${isNormal
                  ? (isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.2)')
                  : (isDark ? 'rgba(251,191,36,0.25)' : 'rgba(245,158,11,0.2)')}`,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: isNormal ? '#4ade80' : '#fbbf24',
                }} />
                {isNormal ? 'Normal' : (val < m.normal.min ? 'Below range' : 'Above range')}
              </div>
            )}

            {/* Range bar */}
            <RangeBar value={val} normal={m.normal} color={accent} isDark={isDark} />

            {/* Range text */}
            <div style={{ marginTop: 8, fontSize: 10, color: textSub }}>
              Reference: <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>{m.normalText}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
