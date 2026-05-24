import { useMemo } from 'react'
import { Card, Table, Tag, Button, Row, Col, Typography, Empty, Space } from 'antd'
import {
  PlusOutlined, RightOutlined,
  BarChartOutlined, CheckCircleOutlined,
  SyncOutlined, WarningOutlined, AlertOutlined,
} from '@ant-design/icons'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Activity, Cpu, ShieldCheck, Clock } from 'lucide-react'
import { fmtDate, diagTagColor, DIAG_CONFIG } from '../constants'
import { useTheme } from '../context/ThemeContext'

const { Text, Title } = Typography

// ─── helpers ─────────────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── EF Trend Chart ──────────────────────────────────────────────────────────
function EFTrendChart({ jobs, isDark }) {
  const data = useMemo(() => {
    return [...jobs]
      .filter(j => j.status === 'completed' && j.measurements?.ef_final != null)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-20)
      .map((j, i) => ({
        name: j.patient_name ? j.patient_name.split(' ')[0] : `Study ${i + 1}`,
        ef: parseFloat(j.measurements.ef_final.toFixed(1)),
        date: fmtDate(j.created_at).split('  ·')[0],
      }))
  }, [jobs])

  const gridColor   = isDark ? '#374151' : '#e5e7eb'
  const axisColor   = isDark ? '#6b7280' : '#9ca3af'
  const tooltipBg   = isDark ? '#1f2937' : '#ffffff'
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb'
  const lineColor   = '#6366f1'

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
        <Activity className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No completed studies yet</p>
        <p className="text-xs mt-1">EF trend will appear after your first analysis</p>
      </div>
    )
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: axisColor }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            domain={[20, 80]}
            tick={{ fontSize: 11, fill: axisColor }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            labelStyle={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 600 }}
            formatter={(value) => [`${value}%`, 'EF']}
          />
          {/* Normal range reference lines */}
          <ReferenceLine y={55} stroke="#22c55e" strokeDasharray="5 3" strokeOpacity={0.5}
            label={{ value: '55% Normal', fill: '#22c55e', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 3" strokeOpacity={0.5}
            label={{ value: '30% Severe', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
          <Line
            type="monotone"
            dataKey="ef"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Alerts Panel ────────────────────────────────────────────────────────────
function AlertsPanel({ jobs, isDark, onViewJob }) {
  const critical = useMemo(() => {
    return jobs
      .filter(j => j.status === 'completed' && j.measurements?.ef_final != null && j.measurements.ef_final < 35)
      .sort((a, b) => a.measurements.ef_final - b.measurements.ef_final)
      .slice(0, 4)
  }, [jobs])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertOutlined style={{ color: critical.length > 0 ? '#ef4444' : '#9ca3af', fontSize: 14 }} />
          <span className="text-sm font-semibold" style={{ color: isDark ? '#f9fafb' : '#111827' }}>
            Critical Alerts
          </span>
        </div>
        {critical.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            {critical.length}
          </span>
        )}
      </div>
      {critical.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-1">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          No abnormal findings requiring urgent attention
        </div>
      ) : (
        <ul className="space-y-2">
          {critical.map(j => (
            <li key={j.job_id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style={{ boxShadow: '0 0 5px rgba(239,68,68,0.7)' }} />
                <span className="text-xs truncate" style={{ color: isDark ? '#e5e7eb' : '#374151' }}>
                  {j.patient_name || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-red-500">{j.measurements.ef_final.toFixed(1)}%</span>
                <button onClick={() => onViewJob(j.job_id)} className="text-xs text-indigo-500 hover:underline">
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Model Health Panel ───────────────────────────────────────────────────────
function ModelHealth({ isDark }) {
  const models = [
    { name: 'nnU-Net Segmentation', acc: 'IoU 0.88', status: 'OK'    },
    { name: 'R(2+1)D-18 + Attention', acc: 'MAE 3.2%', status: 'OK' },
    { name: 'Ensemble EF',          acc: 'Combined',  status: 'OK'    },
  ]
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-sm font-semibold" style={{ color: isDark ? '#f9fafb' : '#111827' }}>
          Model Health
        </span>
      </div>
      <ul className="space-y-2">
        {models.map(m => (
          <li key={m.name} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: isDark ? '#e5e7eb' : '#374151' }}>{m.name}</div>
              <div className="text-[11px]" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>{m.acc}</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
              m.status === 'OK'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {m.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed({ jobs, isDark, onViewJob }) {
  const items = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
      .map(j => ({
        id: j.job_id,
        name: j.patient_name || 'Anonymous',
        status: j.status,
        time: relativeTime(j.created_at),
        ef: j.measurements?.ef_final,
        diag: j.measurements?.diagnosis,
      }))
  }, [jobs])

  const statusDot = {
    completed: 'bg-green-500',
    running:   'bg-blue-500 animate-pulse',
    queued:    'bg-yellow-500 animate-pulse',
    failed:    'bg-red-500',
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-sm font-semibold" style={{ color: isDark ? '#f9fafb' : '#111827' }}>
          Recent Activity
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">No activity yet</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(it => (
            <li key={it.id} className="flex items-start gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${statusDot[it.status] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium truncate" style={{ color: isDark ? '#e5e7eb' : '#374151' }}>
                    {it.name}
                  </span>
                  <span className="text-[11px] flex-shrink-0" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>{it.time}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tag
                    color={{ completed: 'success', running: 'processing', queued: 'default', failed: 'error' }[it.status] || 'default'}
                    style={{ fontSize: 10, borderRadius: 20, padding: '0 6px', lineHeight: '16px', margin: 0 }}
                  >
                    {it.status}
                  </Tag>
                  {it.ef != null && (
                    <span className="text-[11px] font-bold" style={{ color: '#6366f1' }}>{it.ef.toFixed(1)}%</span>
                  )}
                  {it.status === 'completed' && (
                    <button onClick={() => onViewJob(it.id)} className="text-[11px] text-indigo-500 hover:underline ml-auto">Report →</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ jobs, onNewAnalysis, onViewJob }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const counts = {
    total:     jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    running:   jobs.filter(j => j.status === 'running' || j.status === 'queued').length,
    failed:    jobs.filter(j => j.status === 'failed').length,
  }

  const avgEF = useMemo(() => {
    const done = jobs.filter(j => j.measurements?.ef_final != null)
    if (!done.length) return null
    return (done.reduce((s, j) => s + j.measurements.ef_final, 0) / done.length).toFixed(1)
  }, [jobs])

  const recent = useMemo(() =>
    [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)
  , [jobs])

  // ── Stat card configs ────────────────────────────────────────────────────
  const STAT_CFG = [
    {
      label: 'Total Analyses', key: 'total',
      icon: <BarChartOutlined />,
      color: '#6366f1',
      bgLight: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
      bgDark:  'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.1))',
      borderLight: '#c4b5fd', borderDark: 'rgba(99,102,241,0.3)',
    },
    {
      label: 'Completed', key: 'completed',
      icon: <CheckCircleOutlined />,
      color: '#22c55e',
      bgLight: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
      bgDark:  'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.1))',
      borderLight: '#86efac', borderDark: 'rgba(34,197,94,0.3)',
    },
    {
      label: 'In Progress', key: 'running',
      icon: <SyncOutlined spin={counts.running > 0} />,
      color: '#f59e0b',
      bgLight: 'linear-gradient(135deg,#fef3c7,#fde68a)',
      bgDark:  'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.1))',
      borderLight: '#fcd34d', borderDark: 'rgba(245,158,11,0.3)',
    },
    {
      label: 'Failed', key: 'failed',
      icon: <WarningOutlined />,
      color: '#ef4444',
      bgLight: 'linear-gradient(135deg,#fee2e2,#fecaca)',
      bgDark:  'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.1))',
      borderLight: '#fca5a5', borderDark: 'rgba(239,68,68,0.3)',
    },
  ]

  const cardBg     = isDark ? '#1f2937' : '#ffffff'
  const cardBorder = isDark ? '#374151' : '#f0f0f0'
  const textMain   = isDark ? '#f9fafb' : '#111827'
  const textSub    = isDark ? '#9ca3af' : '#6b7280'

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Patient',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: textMain }}>
            {r.patient_name || <Text type="secondary" style={{ fontStyle: 'italic', fontWeight: 400 }}>Anonymous</Text>}
          </div>
          {r.patient_id && <div style={{ fontSize: 11, color: textSub, marginTop: 1 }}>ID: {r.patient_id}</div>}
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
        ? <span style={{ fontWeight: 800, color: '#6366f1', fontSize: 15 }}>{r.measurements.ef_final.toFixed(1)}%</span>
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
      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <Title level={5} style={{ margin: '0 0 2px', color: textMain }}>Overview</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Cardiac analysis study summary</Text>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={14} style={{ marginBottom: 22 }}>
        {STAT_CFG.map(s => (
          <Col span={6} key={s.key}>
            <Card
              bordered={false}
              className="stat-card"
              style={{
                boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
                borderRadius: 12,
                border: `1px solid ${isDark ? s.borderDark : s.borderLight}`,
                background: cardBg,
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '20px 22px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: textSub, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 10 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: -1 }}>
                    {counts[s.key]}
                  </div>
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: isDark ? s.bgDark : s.bgLight,
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

      {/* ── Main content + sidebar ── */}
      <Row gutter={14} style={{ marginBottom: 14 }}>

        {/* LEFT: Chart + table */}
        <Col span={17}>

          {/* EF Trend Chart */}
          <Card
            bordered={false}
            style={{
              boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
              borderRadius: 12,
              border: `1px solid ${cardBorder}`,
              background: cardBg,
              marginBottom: 14,
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity style={{ width: 14, height: 14, color: '#6366f1' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: textMain }}>EF Trend</span>
                </div>
                {avgEF && (
                  <div style={{ fontSize: 12, color: textSub }}>
                    Avg: <span style={{ fontWeight: 700, color: '#6366f1' }}>{avgEF}%</span>
                  </div>
                )}
              </div>
            }
          >
            <EFTrendChart jobs={jobs} isDark={isDark} />
          </Card>

          {/* Recent studies table */}
          {jobs.length === 0 ? (
            <Card
              bordered={false}
              style={{ boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)', borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg }}
            >
              <Empty
                description={
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: textMain, marginBottom: 6 }}>No analyses yet</div>
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
                  <span style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Recent Studies</span>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>{recent.length} most recent</Text>
                </div>
              }
              style={{ boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)', borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg }}
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
        </Col>

        {/* RIGHT: Sidebar panels */}
        <Col span={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Alerts */}
            <Card
              bordered={false}
              style={{
                boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
                background: cardBg,
              }}
              bodyStyle={{ padding: '16px 18px' }}
            >
              <AlertsPanel jobs={jobs} isDark={isDark} onViewJob={onViewJob} />
            </Card>

            {/* Model Health */}
            <Card
              bordered={false}
              style={{
                boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
                background: cardBg,
              }}
              bodyStyle={{ padding: '16px 18px' }}
            >
              <ModelHealth isDark={isDark} />
            </Card>

            {/* Activity feed */}
            <Card
              bordered={false}
              style={{
                boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
                background: cardBg,
              }}
              bodyStyle={{ padding: '16px 18px' }}
            >
              <ActivityFeed jobs={jobs} isDark={isDark} onViewJob={onViewJob} />
            </Card>

          </div>
        </Col>
      </Row>

      {/* ── About card ── */}
      <Card
        bordered={false}
        style={{
          boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.07)',
          borderRadius: 12,
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#c4b5fd'}`,
          background: isDark
            ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%)'
            : 'linear-gradient(135deg, #fafcff 0%, #f0f4ff 100%)',
        }}
        bodyStyle={{ padding: '22px 26px' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={5} style={{ margin: '0 0 8px', color: textMain }}>About CardioVision</Title>
            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.75, display: 'block' }}>
              Automated cardiac function assessment from echocardiography using
              <strong> nnU-Net</strong> segmentation and <strong>R(2+1)D-18</strong> with spatial + temporal attention.
              Computes EF, EDV, ESV, Stroke Volume via Biplane Simpson method.
            </Text>
            <Space size={6} wrap style={{ marginTop: 14 }}>
              {['nnU-Net', 'Biplane Simpson', 'R(2+1)D-18', 'Ensemble EF', 'CAMUS Dataset'].map(t => (
                <Tag key={t} color="blue" style={{ fontSize: 11, fontWeight: 500, borderRadius: 20, padding: '1px 10px' }}>{t}</Tag>
              ))}
            </Space>
          </Col>
          <Col flex="none">
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onNewAnalysis}
              style={{ borderRadius: 8, height: 42, fontWeight: 600, paddingInline: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none' }}>
              New Analysis
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
