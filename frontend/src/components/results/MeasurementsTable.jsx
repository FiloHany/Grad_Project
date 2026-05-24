import { Table, Tag } from 'antd'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { MEASUREMENTS } from '../../constants'
import { useTheme } from '../../context/ThemeContext'

export default function MeasurementsTable({ measurements }) {
  const { theme } = useTheme()
  const isDark   = theme === 'dark'
  const textMain  = isDark ? '#f9fafb' : '#1a1a2e'
  const textMuted = isDark ? '#9ca3af' : '#9ca3af'
  const rowHighlight = isDark ? 'rgba(99,102,241,0.07)' : '#f8fbff'

  const data = MEASUREMENTS.map((def, i) => {
    const val = measurements[def.key]
    const isNull  = val == null
    const inRange = !isNull && def.check ? def.check(val) : null
    return { key: i, def, val, isNull, inRange }
  })

  const columns = [
    {
      title: 'Measurement',
      dataIndex: 'def',
      width: '32%',
      render: (def) => (
        <span>
          <span style={{ fontSize: 13, fontWeight: def.primary ? 700 : 400, color: textMain }}>
            {def.label}
          </span>
          {def.primary && (
            <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>Primary</Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'val',
      width: '22%',
      render: (val, row) => {
        if (row.isNull) return <span style={{ color: isDark ? '#4b5563' : '#d9d9d9', fontSize: 12 }}>N/A</span>
        const color = row.inRange === true ? '#22c55e' : row.inRange === false ? '#ef4444' : textMain
        return (
          <span style={{ fontWeight: 600, fontSize: 13, color }}>
            {val.toFixed(2)} <span style={{ fontWeight: 400, color: textMuted, fontSize: 12 }}>{row.def.unit}</span>
          </span>
        )
      },
    },
    {
      title: 'Normal Range',
      dataIndex: 'def',
      key: 'range',
      width: '24%',
      render: (def, row) => (
        <span>
          <span style={{ fontSize: 12, color: isDark ? '#6b7280' : '#6b7280' }}>{def.range}</span>
          {row.inRange !== null && (
            <Tag
              color={row.inRange ? 'success' : 'error'}
              style={{ marginLeft: 8, fontSize: 10 }}
            >
              {row.inRange ? '✓ Normal' : '✗ Abnormal'}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'def',
      key: 'method',
      render: (def) => (
        <span style={{ fontSize: 11.5, color: textMuted }}>{def.method}</span>
      ),
    },
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      size="small"
      style={{ fontSize: 13 }}
      onRow={(row) => ({
        style: row.def.primary ? { background: rowHighlight, fontWeight: 600 } : {},
      })}
    />
  )
}
