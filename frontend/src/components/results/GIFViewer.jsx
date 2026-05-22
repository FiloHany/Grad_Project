import { useState } from 'react'
import { Segmented, Typography } from 'antd'

const { Text } = Typography

export default function GIFViewer({ visualizations: viz }) {
  const [tab, setTab] = useState('overlay')
  const src = tab === 'overlay' ? viz.overlay_gif : viz.original_gif

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Segmented
          options={[
            { label: 'Segmentation Overlay', value: 'overlay' },
            { label: 'Raw Sequence', value: 'original' },
          ]}
          value={tab}
          onChange={setTab}
          size="small"
          block
        />
      </div>
      <div className="media-dark-bg">
        <img src={src} alt="Cardiac cycle animation" className="gif-frame" />
        <div style={{ color: '#4b5563', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
          Full cardiac cycle · {tab === 'overlay' ? 'Segmentation overlay' : 'Raw ultrasound'}
        </div>
      </div>
    </div>
  )
}
