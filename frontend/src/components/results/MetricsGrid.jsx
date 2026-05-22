import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const METRICS = [
  {
    key: 'ef_final',
    label: 'Ejection Fraction',
    unit: '%',
    color: '#1677ff',
    bgFrom: '#e6f4ff',
    bgTo: '#bae0ff',
    border: '#91caff',
    normal: { min: 55, max: 75, abs_min: 0, abs_max: 100 },
    hint: 'Final ensemble value (biplane Simpson + CNN model average)',
    normalText: '≥ 55%',
  },
  {
    key: 'edv_ml',
    label: 'End-Diastolic Vol.',
    unit: 'mL',
    color: '#722ed1',
    bgFrom: '#f9f0ff',
    bgTo: '#efdbff',
    border: '#d3adf7',
    normal: { min: 65, max: 195, abs_min: 0, abs_max: 300 },
    hint: 'Maximum LV volume at end of filling phase',
    normalText: '65–195 mL',
  },
  {
    key: 'esv_ml',
    label: 'End-Systolic Vol.',
    unit: 'mL',
    color: '#eb2f96',
    bgFrom: '#fff0f6',
    bgTo: '#ffd6e7',
    border: '#ffadd2',
    normal: { min: 16, max: 80, abs_min: 0, abs_max: 200 },
    hint: 'Minimum LV volume at end of contraction',
    normalText: '16–80 mL',
  },
  {
    key: 'sv_ml',
    label: 'Stroke Volume',
    unit: 'mL',
    color: '#13c2c2',
    bgFrom: '#e6fffb',
    bgTo: '#b5f5ec',
    border: '#87e8de',
    normal: { min: 50, max: 120, abs_min: 0, abs_max: 200 },
    hint: 'Volume ejected per heartbeat: EDV − ESV',
    normalText: '50–120 mL',
  },
]

function NormalRangeBar({ value, normal, color }) {
  if (value == null) return null
  const { min, max, abs_min, abs_max } = normal
  const range = abs_max - abs_min
  const fillPct  = Math.min(100, Math.max(0, ((value - abs_min) / range) * 100))
  const normStart = ((min - abs_min) / range) * 100
  const normEnd   = ((max - abs_min) / range) * 100
  const isNormal  = value >= min && value <= max

  return (
    <div style={{ marginTop: 10, position: 'relative', height: 4 }}>
      {/* track */}
      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        {/* normal zone highlight */}
        <div style={{
          position: 'absolute', top: 0, height: '100%',
          left: `${normStart}%`, width: `${normEnd - normStart}%`,
          background: 'rgba(82,196,26,0.2)',
          borderRadius: 2,
        }} />
        {/* fill bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${fillPct}%`,
          background: isNormal ? color : (value < min ? '#faad14' : '#ff4d4f'),
          borderRadius: 2,
          transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      {/* marker dot */}
      <div style={{
        position: 'absolute', top: -3, left: `calc(${fillPct}% - 5px)`,
        width: 10, height: 10, borderRadius: '50%',
        background: isNormal ? color : (value < min ? '#faad14' : '#ff4d4f'),
        border: '2px solid #fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  )
}

export default function MetricsGrid({ measurements }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
      {METRICS.map(m => {
        const val = measurements[m.key]
        const isNormal = val != null && val >= m.normal.min && val <= m.normal.max

        return (
          <div
            key={m.key}
            className="metric-card"
            style={{
              borderRadius: 12,
              background: `linear-gradient(160deg, ${m.bgFrom} 0%, ${m.bgTo} 100%)`,
              border: `1px solid ${m.border}`,
              padding: '18px 18px 14px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}
          >
            {/* Label row */}
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: '#6b7280',
              letterSpacing: 0.5, textTransform: 'uppercase',
              marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{m.label}</span>
              <Tooltip title={m.hint}>
                <InfoCircleOutlined style={{ fontSize: 11, color: '#c0c7d0', cursor: 'pointer' }} />
              </Tooltip>
            </div>

            {/* Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: m.color, lineHeight: 1, letterSpacing: -1 }}>
                {val != null ? val.toFixed(1) : '—'}
              </span>
              {val != null && (
                <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>{m.unit}</span>
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
                <span style={{ fontSize: 10, color: '#c0c7d0', marginLeft: 'auto' }}>{m.normalText}</span>
              </div>
            )}

            <NormalRangeBar value={val} normal={m.normal} color={m.color} />
          </div>
        )
      })}
    </div>
  )
}
