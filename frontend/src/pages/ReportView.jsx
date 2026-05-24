import { Card, Row, Col, Button, Space, Typography, Tag, Divider } from 'antd'
import { PlusOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import DiagnosisBanner from '../components/results/DiagnosisBanner'
import MetricsGrid from '../components/results/MetricsGrid'
import MeasurementsTable from '../components/results/MeasurementsTable'
import FrameViewer from '../components/results/FrameViewer'
import GIFViewer from '../components/results/GIFViewer'
import { DIAG_CONFIG, fmtDate } from '../constants'
import { useTheme } from '../context/ThemeContext'

const { Text, Title } = Typography

function EFBreakdown({ measurements: m, isDark }) {
  const textMain  = isDark ? '#f9fafb' : '#111827'
  const textSub   = isDark ? '#9ca3af' : '#9ca3af'
  const blockPrimBg     = isDark ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.08))' : 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)'
  const blockPrimBorder = isDark ? 'rgba(99,102,241,0.4)'  : '#91caff'
  const blockPrimTop    = isDark ? '#6366f1' : '#1677ff'
  const blockSecBg     = isDark ? 'rgba(255,255,255,0.03)' : '#fafafa'
  const blockSecBorder = isDark ? '#374151' : '#f0f0f0'
  const blockSecTop    = isDark ? '#374151' : '#d9d9d9'

  const items = [
    { label: 'Biplane Simpson', value: m.ef_biplane, note: 'Segmentation-based — clinical standard', primary: false },
    { label: 'CNN Model',        value: m.ef_cnn,     note: 'Deep learning from raw video sequence', primary: false, nullable: true },
    { label: 'Final Ensemble',   value: m.ef_final,   note: 'Average of both methods',               primary: true },
  ]

  return (
    <Row gutter={14}>
      {items.map(item => (
        <Col span={8} key={item.label}>
          <div style={{
            textAlign: 'center',
            padding: '18px 14px',
            background: item.primary ? blockPrimBg : blockSecBg,
            border: `1px solid ${item.primary ? blockPrimBorder : blockSecBorder}`,
            borderTop: `3px solid ${item.primary ? blockPrimTop : blockSecTop}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: textSub, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: item.primary ? '#6366f1' : textMain, letterSpacing: -1 }}>
              {item.value != null
                ? <>{item.value.toFixed(1)}<span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0 }}>%</span></>
                : <span style={{ fontSize: 22, color: isDark ? '#4b5563' : '#d9d9d9' }}>N/A</span>}
            </div>
            <div style={{ fontSize: 11, color: textSub, marginTop: 8, lineHeight: 1.5 }}>{item.note}</div>
            {item.nullable && item.value == null && (
              <div style={{ fontSize: 11, color: '#fa8c16', marginTop: 6, fontWeight: 600 }}>Sequence &lt; 48 frames</div>
            )}
          </div>
        </Col>
      ))}
    </Row>
  )
}

export default function ReportView({ report, onNewAnalysis, onViewHistory }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textMain   = isDark ? '#f9fafb' : '#111827'
  const cardBg     = isDark ? '#1f2937' : '#ffffff'
  const cardBorder = isDark ? '#374151' : '#f0f0f0'
  const cardShadow = isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.06)'

  const { measurements: m, visualizations: viz, diagnosis, ef_final, job_id, generated_at, patient_name, patient_id } = report

  const sharedCardStyle = {
    boxShadow: cardShadow,
    borderRadius: 12,
    border: `1px solid ${cardBorder}`,
    background: cardBg,
  }

  return (
    <div className="fade-in-up">
      {/* Page header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 22, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <Title level={5} style={{ margin: '0 0 8px', color: textMain, letterSpacing: -0.2 }}>Analysis Report</Title>
          <Space size={6} wrap>
            {patient_name && (
              <Tag icon={<UserOutlined />} style={{ fontSize: 12, borderRadius: 20, padding: '2px 10px', fontWeight: 500 }}>
                {patient_name}
              </Tag>
            )}
            {patient_id && (
              <Tag color="geekblue" style={{ fontSize: 12, borderRadius: 20, padding: '2px 10px' }}>
                ID: {patient_id}
              </Tag>
            )}
            <span className="job-id-code">Job {job_id.substring(0, 8)}…</span>
            <Text type="secondary" style={{ fontSize: 12 }}>{fmtDate(generated_at)}</Text>
          </Space>
        </div>
        <Space>
          <Button icon={<UnorderedListOutlined />} onClick={onViewHistory} style={{ borderRadius: 8 }}>
            Study History
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewAnalysis}
            style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none' }}>
            New Analysis
          </Button>
        </Space>
      </div>

      <DiagnosisBanner diagnosis={diagnosis} efFinal={ef_final} />
      <MetricsGrid measurements={m} />

      {/* Clinical measurements */}
      <Card
        bordered={false}
        style={{ ...sharedCardStyle, marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontWeight: 700, color: textMain }}>Clinical Measurements</span>
            <Space size={6}>
              <Tag style={{ fontSize: 11, borderRadius: 20 }}>ED Frame #{m.ed_frame_index}</Tag>
              <Tag style={{ fontSize: 11, borderRadius: 20 }}>ES Frame #{m.es_frame_index}</Tag>
            </Space>
          </div>
        }
      >
        <MeasurementsTable measurements={m} />
      </Card>

      {/* Frames + GIF */}
      <Row gutter={14} style={{ marginBottom: 16 }}>
        <Col span={15}>
          <Card
            bordered={false}
            title={<span style={{ fontWeight: 700, color: textMain }}>Cardiac Cycle Frames</span>}
            style={{ ...sharedCardStyle, height: '100%' }}
          >
            <FrameViewer visualizations={viz} />
          </Card>
        </Col>
        <Col span={9}>
          <Card
            bordered={false}
            title={<span style={{ fontWeight: 700, color: textMain }}>Cycle Animation</span>}
            style={{ ...sharedCardStyle, height: '100%' }}
          >
            <GIFViewer visualizations={viz} />
          </Card>
        </Col>
      </Row>

      {/* EF Breakdown */}
      <Card
        bordered={false}
        title={<span style={{ fontWeight: 700, color: textMain }}>Ejection Fraction Breakdown</span>}
        style={sharedCardStyle}
      >
        <EFBreakdown measurements={m} isDark={isDark} />
        <Divider style={{ margin: '18px 0 10px', borderColor: isDark ? '#374151' : '#f0f0f0' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          The ensemble combines biplane Simpson (segmentation) and deep learning model outputs for maximum accuracy.
          If the sequence has &lt;48 frames, only the biplane method is used.
        </Text>
      </Card>
    </div>
  )
}
