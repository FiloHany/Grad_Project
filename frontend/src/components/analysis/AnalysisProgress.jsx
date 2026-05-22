import { useState, useEffect } from 'react'
import { Card, Progress, Typography, Button } from 'antd'
import { CheckCircleFilled, LoadingOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons'
import { STAGE_CONFIG, stageIndex } from '../../constants'

const { Text, Title } = Typography

function StepIcon({ state }) {
  if (state === 'done')   return <CheckCircleFilled style={{ fontSize: 20, color: '#52c41a' }} />
  if (state === 'active') return <LoadingOutlined spin style={{ fontSize: 20, color: '#1677ff' }} />
  return <ClockCircleOutlined style={{ fontSize: 20, color: '#e0e0e0' }} />
}

function useElapsed(active) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = Date.now()
    const iv = setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [active])
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function AnalysisProgress({ jobStatus, onCancel }) {
  const si  = stageIndex(jobStatus?.stage)
  const pct = jobStatus?.progress_pct || 0
  const st  = jobStatus?.status
  const elapsed = useElapsed(st === 'running' || st === 'queued')

  const statusLabel =
    st === 'running' ? `${STAGE_CONFIG[si]?.label || 'Processing'}…`
    : st === 'queued' ? 'Queued — waiting for a free worker…'
    : 'Initializing pipeline…'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 20 }} className="fade-in-up">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1677ff 0%, #003eb3 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 28px rgba(22,119,255,0.35)',
        }} className="heartbeat-icon">
          <HeartOutlined style={{ color: '#fff', fontSize: 36 }} />
        </div>
        <Title level={4} style={{ margin: '0 0 6px', letterSpacing: -0.3 }}>
          Analyzing Echocardiography
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          AI pipeline is processing your study — this typically takes 30–120 seconds
        </Text>
      </div>

      {/* Progress card */}
      <Card
        bordered={false}
        style={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 14,
          border: '1px solid #e8ecf4',
          marginBottom: 16,
        }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        {/* Bar + label */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{statusLabel}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>⏱ {elapsed}</Text>
              <Text strong style={{ color: '#1677ff', fontSize: 15, fontWeight: 800 }}>{pct}%</Text>
            </div>
          </div>
          <Progress
            percent={pct}
            strokeColor={{ '0%': '#1677ff', '50%': '#096dd9', '100%': '#52c41a' }}
            trailColor="#f0f2f5"
            strokeWidth={10}
            showInfo={false}
            strokeLinecap="round"
          />
        </div>

        {/* Stage steps */}
        <div>
          {STAGE_CONFIG.map((s, i) => {
            const done   = i < si
            const active = i === si && st === 'running'
            const state  = done ? 'done' : active ? 'active' : 'wait'
            const isLast = i === STAGE_CONFIG.length - 1

            return (
              <div key={s.key} style={{ display: 'flex', gap: 14 }}>
                {/* Icon + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                  <StepIcon state={state} />
                  {!isLast && (
                    <div
                      className={`step-connector-line ${done ? 'done' : ''}`}
                      style={{ width: 2, flex: 1, minHeight: 14, margin: '3px 0', borderRadius: 2 }}
                    />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingTop: 1, paddingBottom: isLast ? 0 : 20 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                    color: done ? '#389e0d' : active ? '#1677ff' : '#c0c7d0',
                    marginBottom: active ? 4 : 0,
                  }}>
                    {s.label}
                    {done && (
                      <span style={{ fontSize: 10, color: '#52c41a', marginLeft: 8, fontWeight: 400 }}>✓ Done</span>
                    )}
                  </div>
                  {active && (
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>{s.desc}</Text>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div style={{ textAlign: 'center' }}>
        <Button
          onClick={onCancel}
          style={{ color: '#9ca3af', border: '1px solid #e8ecf4', borderRadius: 8 }}
          size="small"
        >
          Cancel &amp; Start Over
        </Button>
      </div>
    </div>
  )
}
