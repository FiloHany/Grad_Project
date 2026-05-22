import { Card, Table, Tag, Button, Row, Col, Typography, Empty, Space } from 'antd'
import {
  PlusOutlined, RightOutlined,
  BarChartOutlined, CheckCircleOutlined,
  SyncOutlined, WarningOutlined,
} from '@ant-design/icons'
import { fmtDate, diagTagColor } from '../constants'

const { Text, Title, Paragraph } = Typography

const STAT_CFG = [
  { label: 'Total Analyses', key: 'total',     icon: <BarChartOutlined />,    color: '#1677ff', bg: 'linear-gradient(135deg,#e6f4ff,#bae0ff)', border: '#91caff' },
  { label: 'Completed',      key: 'completed', icon: <CheckCircleOutlined />, color: '#389e0d', bg: 'linear-gradient(135deg,#f6ffed,#d9f7be)', border: '#95de64' },
  { label: 'In Progress',    key: 'running',   icon: <SyncOutlined spin />,   color: '#d46b08', bg: 'linear-gradient(135deg,#fff7e6,#ffe7ba)', border: '#ffd591' },
  { label: 'Failed',         key: 'failed',    icon: <WarningOutlined />,     color: '#cf1322', bg: 'linear-gradient(135deg,#fff1f0,#ffccc7)', border: '#ffa39e' },
]

export default function Dashboard({ jobs, onNewAnalysis, onViewJob }) {
  const counts = {
    total:     jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    running:   jobs.filter(j => j.status === 'running' || j.status === 'queued').length,
    failed:    jobs.filter(j => j.status === 'failed').length,
  }
  const recent = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)

  const columns = [
    {
      title: 'Patient',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {r.patient_name || <Text type="secondary" style={{ fontStyle: 'italic', fontWeight: 400 }}>Anonymous</Text>}
          </div>
          {r.patient_id && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>ID: {r.patient_id}</div>}
        </div>
      ),
    },
    {
      title: 'Date',
      render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{fmtDate(r.created_at)}</Text>,
    },
    {
      title: 'EF',
      align: 'right',
      render: (_, r) => r.measurements?.ef_final != null
        ? <span style={{ fontWeight: 800, color: '#1677ff', fontSize: 15 }}>{r.measurements.ef_final.toFixed(1)}%</span>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Diagnosis',
      render: (_, r) => r.measurements?.diagnosis
        ? <Tag color={diagTagColor(r.measurements.diagnosis)} style={{ fontSize: 12, fontWeight: 500 }}>{r.measurements.diagnosis}</Tag>
        : <Tag style={{ fontSize: 12 }}>{r.status}</Tag>,
    },
    {
      title: '',
      align: 'right',
      render: (_, r) => r.status === 'completed'
        ? <Button type="link" size="small" icon={<RightOutlined />} onClick={() => onViewJob(r.job_id)} style={{ fontSize: 12, padding: 0, fontWeight: 600 }}>Report</Button>
        : null,
    },
  ]

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ margin: '0 0 2px' }}>Overview</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Cardiac analysis study summary</Text>
      </div>

      {/* Stat cards */}
      <Row gutter={14} style={{ marginBottom: 22 }}>
        {STAT_CFG.map(s => (
          <Col span={6} key={s.key}>
            <Card
              bordered={false}
              className="stat-card"
              style={{
                boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                borderRadius: 12,
                border: `1px solid ${s.border}`,
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '20px 22px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 10 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: -1 }}>
                    {counts[s.key]}
                  </div>
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: s.color, flexShrink: 0,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {counts.total === 0 ? (
        <Card
          bordered={false}
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.07)', borderRadius: 12, border: '1px solid #f0f0f0' }}
        >
          <Empty
            description={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No analyses yet</div>
                <Text type="secondary" style={{ fontSize: 13 }}>Upload your first echocardiography study to get started.</Text>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '48px 0' }}
          >
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onNewAnalysis} style={{ borderRadius: 8, height: 40 }}>
              Start First Analysis
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card
          bordered={false}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Recent Studies</span>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>{recent.length} most recent</Text>
            </div>
          }
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.07)', borderRadius: 12, border: '1px solid #f0f0f0', marginBottom: 16 }}
        >
          <Table
            dataSource={recent}
            columns={columns}
            rowKey="job_id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* About / model info */}
      <Card
        bordered={false}
        style={{
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
          borderRadius: 12,
          border: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #fafcff 0%, #f0f7ff 100%)',
        }}
        bodyStyle={{ padding: '22px 26px' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={5} style={{ margin: '0 0 8px', color: '#111827' }}>About CardioVision</Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, lineHeight: 1.75 }}>
              Automated cardiac function assessment from echocardiography using
              <strong> nnU-Net</strong> segmentation and <strong>R(2+1)D-18</strong> with spatial + temporal attention.
              Computes EF, EDV, ESV, Stroke Volume via Biplane Simpson method.
            </Paragraph>
            <Space size={6} wrap style={{ marginTop: 14 }}>
              {['nnU-Net', 'Biplane Simpson', 'R(2+1)D-18', 'Ensemble EF', 'CAMUS Dataset'].map(t => (
                <Tag key={t} color="blue" style={{ fontSize: 11, fontWeight: 500, borderRadius: 20, padding: '1px 10px' }}>{t}</Tag>
              ))}
            </Space>
          </Col>
          <Col flex="none">
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onNewAnalysis}
              style={{ borderRadius: 8, height: 42, fontWeight: 600, paddingInline: 20 }}>
              New Analysis
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
