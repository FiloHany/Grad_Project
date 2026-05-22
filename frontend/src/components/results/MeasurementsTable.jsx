import { Table, Tag, Tooltip } from 'antd'
import { MEASUREMENTS } from '../../constants'

export default function MeasurementsTable({ measurements }) {
  const data = MEASUREMENTS.map((def, i) => {
    const val = measurements[def.key]
    const isNull = val == null
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
          <span style={{ fontSize: 13, fontWeight: def.primary ? 700 : 400, color: '#1a1a2e' }}>
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
        if (row.isNull) return <span style={{ color: '#d9d9d9', fontSize: 12 }}>N/A</span>
        const color = row.inRange === true ? '#389e0d' : row.inRange === false ? '#cf1322' : '#1a1a2e'
        return (
          <span style={{ fontWeight: 600, fontSize: 13, color }}>
            {val.toFixed(2)} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>{row.def.unit}</span>
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>{def.range}</span>
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
        <span style={{ fontSize: 11.5, color: '#9ca3af' }}>{def.method}</span>
      ),
    },
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      size="small"
      rowClassName={(row) => row.def.primary ? 'ant-table-row-primary' : ''}
      style={{ fontSize: 13 }}
      onRow={(row) => ({
        style: row.def.primary
          ? { background: '#f8fbff', fontWeight: 600 }
          : {},
      })}
    />
  )
}
