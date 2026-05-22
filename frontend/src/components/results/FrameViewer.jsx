import { useState } from 'react'
import { Segmented, Typography } from 'antd'

const { Text } = Typography

const LEGEND = [
  { color: '#3b82f6', label: 'Left Ventricle' },
  { color: '#22c55e', label: 'Myocardium' },
  { color: '#ef4444', label: 'Left Atrium' },
]

export default function FrameViewer({ visualizations: viz }) {
  const [frame, setFrame] = useState('ed')
  const [mode,  setMode]  = useState('overlay')

  const src = mode === 'overlay'
    ? (frame === 'ed' ? viz.ed_overlay  : viz.es_overlay)
    : (frame === 'ed' ? viz.ed_original : viz.es_original)

  const frameLabel = frame === 'ed' ? 'End-Diastole (ED)' : 'End-Systole (ES)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <Segmented
          options={[
            { label: 'End-Diastole (ED)', value: 'ed' },
            { label: 'End-Systole (ES)',  value: 'es' },
          ]}
          value={frame}
          onChange={setFrame}
          size="small"
        />
        <Segmented
          options={[
            { label: 'Overlay', value: 'overlay' },
            { label: 'Original', value: 'original' },
          ]}
          value={mode}
          onChange={setMode}
          size="small"
        />
      </div>

      <div className="media-dark-bg">
        <img src={src} alt={`${frameLabel} ${mode}`} className="cardiac-frame" />
      </div>

      {mode === 'overlay' && (
        <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <Text style={{ fontSize: 11.5, color: '#6b7280' }}>{l.label}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
