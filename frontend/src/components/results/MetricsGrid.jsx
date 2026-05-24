import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'

const METRICS = [
  {
    key: 'ef_final',
    label: 'Ejection Fraction',
    unit: '%',
    color: '#6366f1',
    // light mode
    bgFrom: '#ede9fe', bgTo: '#ddd6fe', border: '#c4b5fd',
    // dark mode
    darkBgFrom: 'rgba(99,102,241,0.15)', darkBgTo: 'rgba(99,102,241,0.08)', darkBorder: 'rgba(99,102,241,0.3)',
    normal: { min: 55, max: 75, abs_min: 0, abs_max: 100 },
    hint: 'Final ensemble value (biplane Simpson + CNN model average)',
    normalText: '≥ 55%',
  },
  {
    key: 'edv_ml',
    label: 'End-Diastolic Vol.',
    unit: 'mL',
    color: '#8b5cf6',
    bgFrom: '#f5f3ff', bgTo: '#ede9fe', border: '#c4b5fd',
    darkBgFrom: 'rgba(139,92,246,0.15)', darkBgTo: 'rgba(139,92,246,0.08)', darkBorder: 'rgba(139,92,246,0.3)',
    normal: { min: 65, max: 195, abs_min: 0, abs_max: 300 },
    hint: 'Maximum LV volume at end of filling phase',
    normalText: '65–195 mL',
  },
  {
    key: 'esv_ml',
    label: 'End-Systolic Vol.',
    unit: 'mL',
    color: '#ec4899',
    bgFrom: '#fdf2f8', bgTo: '#fce7f3', border: '#f9a8d4',
    darkBgFrom: 'rgba(236,72,153,0.15)', darkBgTo: 'rgba(236,72,153,0.08)', darkBorder: 'rgba(236,72,153,0.3)',
    normal: { min: 16, max: 80, abs_min: 0, abs_max: 200 },
    hint: 'Minimum LV volume at end of contraction',
    normalText: '16–80 mL',
  },
  {
    key: 'sv_ml',
    label: 'Stroke Volume',
    unit: 'mL',
    color: '#06b6d4',
    bgFrom: '#ecfeff', bgTo: '#cffafe', border: '#67e8f9',
    darkBgFrom: 'rgba(6,182,212,0.15)', darkBgTo: 'rgba(6,182,212,0.08)', darkBorder: 'rgba(6,182,212,0.3)',
    normal: { min: 50, max: 120, abs_min: 0, abs_max: 200 },
    hint: 'Volume ejected per heartbeat: EDV − ESV',
    normalText: '50–120 mL',
  },
]

function NormalRangeBar({ value, normal, color, isDark }) {
  if (value == null) return null
  const { min, max, abs_min, abs_max } = normal
  const range     = abs_max - abs_min
  const fillPct   = Math.min(100, Math.max(0, ((value - abs_min) / range) * 100))
  const normStart = ((min - abs_min) / range) * 100
  const normEnd   = ((max - abs_min) / range) * 100
  const isNormal  = value >= min && value <= max
  const trackBg   = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'

  return (
    <div style={{ marginTop: 10, position: 'relative', height: 4 }}>
      <div style={{ height: 4, background: trackBg, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, height: '100%',
          left: `${normStart}%`, width: `${normEnd - normStart}%`,
          background: 'rgba(82,196,26,0.2)', borderRadius: 2,
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${fillPct}%`,
          background: isNormal ? color : (value < min ? '#faad14' : '#ff4d4f'),
          borderRadius: 2,
          transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      <div style={{
        position: 'absolute', top: -3, left: `calc(${fillPct}% - 5px)`,
        width: 10, height: 10, borderRadius: '50%',
        background: isNormal ? color : (value < min ? '#faad14' : '#ff4d4f'),
        border: `2px solid ${isDark ? '#1f2937' : '#fff'}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        transition: 'left 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  )
}

export default function MetricsGrid({ measurements }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
      {METRICS.map(m => {
        const val      = measurements[m.key]
        const isNormal = val != null && val >= m.normal.min && val <= m.normal.max
        const bg       = isDark
          ? `linear-gradient(160deg, ${m.darkBgFrom} 0%, ${m.darkBgTo} 100%)`
          : `linear-gradient(160deg, ${m.bgFrom} 0%, ${m.bgTo} 100%)`
        const bdr      = isDark ? m.darkBorder : m.border
        const labelClr = isDark ? '#9ca3af' : '#6b7280'
        const unitClr  = isDark ? '#6b7280' : '#9ca3af'
        const refClr   = isDark ? '#4b5563' : '#c0c7d0'

        return (
          <div
            key={m.key}
            className="metric-card"
            style={{
              borderRadius: 12,
              background: bg,
              border: `1px solid ${bdr}`,
              padding: '18px 18px 14px',
              boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.06)',
            }}
          >
            {/* Label row */}
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: labelClr,
              letterSpacing: 0.5, textTransform: 'uppercase',
              marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{m.label}</span>
              <Tooltip title={m.hint}>
                <InfoCircleOutlined style={{ fontSize: 11, color: refClr, cursor: 'pointer' }} />
              </Tooltip>
            </div>

            {/* Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: m.color, lineHeight: 1, letterSpacing: -1 }}>
                {val != null ? val.toFixed(1) : '—'}
              </span>
              {val != null && (
                <span style={{ fontSize: 14, fontWeight: 500, color: unitClr }}>{m.unit}</span>
              )}
            </div>

            {/* Normal indicator */}
            {val != null && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isNormal ? '#52c41a' : '#faad14',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 10.5, color: isNormal ? '#52c41a' : '#d46b08', fontWeight: 600 }}>
                  {isNormal ? 'Normal' : (val < m.normal.min ? 'Below normal' : 'Above normal')}
                </span>
                <span style={{ fontSize: 10, color: refClr, marginLeft: 'auto' }}>{m.normalText}</span>
              </div>
            )}

            <NormalRangeBar value={val} normal={m.normal} color={m.color} isDark={isDark} />
          </div>
        )
      })}
    </div>
  )
}
