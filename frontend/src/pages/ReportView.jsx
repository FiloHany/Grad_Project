import { Card, Row, Col, Button, Space, Typography, Tag, Divider, Tooltip } from 'antd'
import { PlusOutlined, UnorderedListOutlined, PrinterOutlined, UserOutlined } from '@ant-design/icons'
import DiagnosisBanner from '../components/results/DiagnosisBanner'
import MetricsGrid from '../components/results/MetricsGrid'
import MeasurementsTable from '../components/results/MeasurementsTable'
import FrameViewer from '../components/results/FrameViewer'
import GIFViewer from '../components/results/GIFViewer'
import { DIAG_CONFIG, fmtDate } from '../constants'

const { Text, Title } = Typography

function EFBreakdown({ measurements: m }) {
  const items = [
    { label: 'Biplane Simpson', value: m.ef_biplane, note: 'Segmentation-based — clinical standard', primary: false },
    { label: 'CNN Model',        value: m.ef_cnn,     note: 'Deep learning from raw video sequence', primary: false, nullable: true },
    { label: 'Final Ensemble',   value: m.ef_final,   note: 'Average of both methods',               primary: true },
  ]

  return (
    <Row gutter={14}>
      {items.map(item => (
        <Col span={8} key={item.label}>
          <div className={item.primary ? 'ef-primary-block' : 'ef-secondary-block'} style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: item.primary ? '#1677ff' : '#374151', letterSpacing: -1 }}>
              {item.value != null
                ? <>{item.value.toFixed(1)}<span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0 }}>%</span></>
                : <span style={{ fontSize: 22, color: '#d9d9d9' }}>N/A</span>}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, lineHeight: 1.5 }}>{item.note}</div>
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
  const { measurements: m, visualizations: viz, diagnosis, ef_final, job_id, generated_at, patient_name, patient_id } = report

  return (
    <div className="fade-in-up">
      {/* Page header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 22, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <Title level={5} style={{ margin: '0 0 8px', letterSpacing: -0.2 }}>Analysis Report</Title>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewAnalysis} style={{ borderRadius: 8, fontWeight: 600 }}>
            New Analysis
          </Button>
        </Space>
      </div>

      <DiagnosisBanner diagnosis={diagnosis} efFinal={ef_final} />
      <MetricsGrid measurements={m} />

      {/* Clinical measurements */}
      <Card
        bordered={false}
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 12, marginBottom: 16, border: '1px solid #f0f0f0' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontWeight: 700 }}>Clinical Measurements</span>
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
            title={<span style={{ fontWeight: 700 }}>Cardiac Cycle Frames</span>}
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 12, height: '100%', border: '1px solid #f0f0f0' }}
          >
            <FrameViewer visualizations={viz} />
          </Card>
        </Col>
        <Col span={9}>
          <Card
            bordered={false}
            title={<span style={{ fontWeight: 700 }}>Cycle Animation</span>}
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 12, height: '100%', border: '1px solid #f0f0f0' }}
          >
            <GIFViewer visualizations={viz} />
          </Card>
        </Col>
      </Row>

      {/* EF Breakdown */}
      <Card
        bordered={false}
        title={<span style={{ fontWeight: 700 }}>Ejection Fraction Breakdown</span>}
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 12, border: '1px solid #f0f0f0' }}
      >
        <EFBreakdown measurements={m} />
        <Divider style={{ margin: '18px 0 10px' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          The ensemble combines biplane Simpson (segmentation) and deep learning model outputs for maximum accuracy.
          If the sequence has &lt;48 frames, only the biplane method is used.
        </Text>
      </Card>
    </div>
  )
}
