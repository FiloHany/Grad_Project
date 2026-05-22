import { useState } from 'react'
import { Card, Row, Col, Form, Input, Button, Upload, Alert, Divider, Typography, Space, Tag, App as AntApp } from 'antd'
import { InboxOutlined, CheckCircleFilled, DeleteOutlined, FileOutlined } from '@ant-design/icons'
import { uploadStudy, analyzeStudy } from '../../api/client'
import { STAGE_CONFIG } from '../../constants'

const { Dragger } = Upload
const { Text, Title } = Typography

function FileSlot({ label, required, file, onFile, accept }) {
  const { message } = AntApp.useApp()

  const props = {
    name: 'file',
    multiple: false,
    accept,
    showUploadList: false,
    beforeUpload: (f) => {
      if (!f.name.endsWith('.nii') && !f.name.endsWith('.nii.gz')) {
        message.error(`"${f.name}" is not a valid NIfTI file (.nii or .nii.gz)`)
        return Upload.LIST_IGNORE
      }
      onFile(f)
      return false
    },
  }

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Text strong style={{ fontSize: 13 }}>{label}</Text>
        {required && <Text type="danger">*</Text>}
        {file && <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: 11 }}>Loaded</Tag>}
      </div>

      {file ? (
        <div style={{
          border: '1.5px solid #b7eb8f', borderRadius: 8, background: '#f6ffed',
          padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <FileOutlined style={{ fontSize: 22, color: '#52c41a', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · NIfTI sequence
              </div>
            </div>
          </div>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onFile(null)}
            style={{ flexShrink: 0 }}
          />
        </div>
      ) : (
        <Dragger {...props} style={{ borderRadius: 8 }}>
          <div style={{ padding: '8px 0' }}>
            <InboxOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 8, display: 'block' }} />
            <Text strong style={{ fontSize: 13 }}>Drop file or click to browse</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>.nii or .nii.gz format required</Text>
            </div>
          </div>
        </Dragger>
      )}
    </div>
  )
}

export default function UploadForm({ onAnalysisStart }) {
  const { message } = AntApp.useApp()
  const [form] = Form.useForm()
  const [file4ch, setFile4ch] = useState(null)
  const [file2ch, setFile2ch] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!file4ch || !file2ch) {
      message.warning('Please upload both echocardiography sequences before running analysis.')
      return
    }
    const { patientName, patientId } = form.getFieldsValue()
    setLoading(true)
    try {
      const study = await uploadStudy(file4ch, file2ch, patientName, patientId)
      const job   = await analyzeStudy(study.study_id)
      onAnalysisStart(job.job_id)
    } catch (err) {
      message.error(err.message || 'Failed to start analysis. Please try again.')
      setLoading(false)
    }
  }

  const ready = file4ch && file2ch

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <Card
        bordered={false}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 10 }}
      >
        <div style={{ marginBottom: 22 }}>
          <Title level={5} style={{ margin: 0 }}>New Cardiac Study Analysis</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Upload two NIfTI echocardiography sequences to begin automated analysis
          </Text>
        </div>

        <Alert
          type="info"
          showIcon
          message="Processing time is approximately 30–120 seconds depending on sequence length and available hardware."
          style={{ marginBottom: 24, borderRadius: 8 }}
        />

        <Form form={form} layout="vertical" requiredMark={false}>
          <Divider orientation="left" orientationMargin={0} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            Patient Information <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>(optional)</Text>
          </Divider>
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={12}>
              <Form.Item name="patientName" label={<Text style={{ fontSize: 13 }}>Patient Name</Text>} style={{ marginBottom: 12 }}>
                <Input placeholder="e.g. John Doe" size="middle" prefix={<span style={{ color: '#bbb', fontSize: 12 }}>👤</span>} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="patientId" label={<Text style={{ fontSize: 13 }}>Patient ID</Text>} style={{ marginBottom: 12 }}>
                <Input placeholder="e.g. PT-00233" size="middle" prefix={<span style={{ color: '#bbb', fontSize: 12 }}>#</span>} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" orientationMargin={0} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            Echocardiography Sequences
          </Divider>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <FileSlot label="4-Chamber View" required file={file4ch} onFile={setFile4ch} accept=".nii,.gz" />
            </Col>
            <Col span={12}>
              <FileSlot label="2-Chamber View" required file={file2ch} onFile={setFile2ch} accept=".nii,.gz" />
            </Col>
          </Row>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {ready ? '✓ Both files loaded — ready to run analysis' : 'Both 4CH and 2CH files are required'}
            </Text>
            <Button
              type="primary"
              size="large"
              loading={loading}
              disabled={!ready}
              onClick={handleSubmit}
              style={{ minWidth: 200, height: 44, fontSize: 15, fontWeight: 500 }}
            >
              {loading ? 'Starting Analysis…' : 'Run Analysis'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Pipeline overview card */}
      <Card
        bordered={false}
        size="small"
        title={<Text style={{ fontSize: 13, fontWeight: 600 }}>Analysis Pipeline</Text>}
        style={{ marginTop: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 10 }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {STAGE_CONFIG.slice(0, -1).map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ flex: 1, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1677ff', letterSpacing: 0.5, marginBottom: 4 }}>
                  STEP {i + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4, marginTop: 3 }}>
                  {s.desc.split(' ').slice(0, 5).join(' ')}…
                </div>
              </div>
              {i < 3 && <div style={{ color: '#d9d9d9', fontSize: 16, flexShrink: 0 }}>›</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
