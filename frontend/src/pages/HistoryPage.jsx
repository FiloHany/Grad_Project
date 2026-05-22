import { Card, Table, Tag, Button, Typography, Space, Empty } from 'antd'
import { RightOutlined, PlusOutlined } from '@ant-design/icons'
import { fmtDate, diagTagColor } from '../constants'

const { Text, Title } = Typography

export default function HistoryPage({ jobs, onViewJob, onNewAnalysis }) {
  const sorted = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const columns = [
    {
      title: 'Patient',
      width: '22%',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {r.patient_name || <Text type="secondary" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 13 }}>Anonymous</Text>}
          </div>
          {r.patient_id && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>ID: {r.patient_id}</div>}
        </div>
      ),
    },
    {
      title: 'Job ID',
      width: '16%',
      render: (_, r) => <span className="job-id-code">{r.job_id.substring(0, 13)}…</span>,
    },
    {
      title: 'Date',
      width: '18%',
      render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{fmtDate(r.created_at)}</Text>,
    },
    {
      title: 'Status',
      width: '12%',
      render: (_, r) => {
        const map = { completed: 'success', running: 'processing', queued: 'default', failed: 'error' }
        return (
          <Tag color={map[r.status] || 'default'} style={{ fontSize: 11.5, fontWeight: 600, borderRadius: 20, padding: '2px 10px' }}>
            {r.status}
          </Tag>
        )
      },
    },
    {
      title: 'EF Final',
      width: '11%',
      align: 'right',
      render: (_, r) => r.measurements?.ef_final != null
        ? <span style={{ fontWeight: 800, color: '#1677ff', fontSize: 15 }}>{r.measurements.ef_final.toFixed(1)}%</span>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Diagnosis',
      width: '18%',
      render: (_, r) => r.measurements?.diagnosis
        ? <Tag color={diagTagColor(r.measurements.diagnosis)} style={{ fontSize: 12, fontWeight: 500, borderRadius: 20, padding: '2px 10px' }}>{r.measurements.diagnosis}</Tag>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Report',
      align: 'right',
      render: (_, r) => {
        if (r.status === 'completed') {
          return (
            <Button type="link" size="small" icon={<RightOutlined />} onClick={() => onViewJob(r.job_id)}
              style={{ fontSize: 12, fontWeight: 600, padding: 0 }}>
              View
            </Button>
          )
        }
        if (r.status === 'running' || r.status === 'queued') {
          return <Text type="secondary" style={{ fontSize: 12 }}>Processing…</Text>
        }
        if (r.status === 'failed') {
          return <Tag color="error" style={{ fontSize: 11, borderRadius: 20 }}>Failed</Tag>
        }
        return null
      },
    },
  ]

  return (
    <div className="fade-in-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <Title level={5} style={{ margin: '0 0 2px' }}>Study History</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {sorted.length} {sorted.length === 1 ? 'study' : 'studies'} in this session
          </Text>
        </div>
        {onNewAnalysis && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewAnalysis} style={{ borderRadius: 8, fontWeight: 600 }}>
            New Analysis
          </Button>
        )}
      </div>

      <Card
        bordered={false}
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderRadius: 12, border: '1px solid #f0f0f0' }}
      >
        <Table
          dataSource={sorted}
          columns={columns}
          rowKey="job_id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} studies` }}
          size="small"
          locale={{
            emptyText: (
              <Empty
                description={<Text type="secondary">No studies yet this session. Run an analysis to populate this list.</Text>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '32px 0' }}
              />
            ),
          }}
        />
      </Card>
    </div>
  )
}
