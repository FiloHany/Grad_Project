import { useState } from 'react'
import { Form, Input, Select, Button, Typography, Alert, Divider, App as AntApp } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, IdcardOutlined, HeartOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

const SPECIALTIES = [
  'Cardiology', 'Echocardiography', 'Cardiac Surgery',
  'Internal Medicine', 'Radiology', 'General Practice', 'Other',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const { message }  = AntApp.useApp()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form]               = Form.useForm()

  async function handleSubmit(values) {
    if (values.password !== values.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({
        full_name:      values.full_name,
        email:          values.email,
        password:       values.password,
        license_number: values.license_number,
        specialty:      values.specialty,
      })
      message.success('Account created — welcome to CardioVision!')
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg,#0d1f3c 0%,#0a1628 60%,#061020 100%)',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: '#fff', borderRadius: 18,
        padding: '44px 40px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 13,
            background: 'linear-gradient(135deg,#1677ff,#003eb3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 6px 18px rgba(22,119,255,0.35)',
          }}>
            <HeartOutlined style={{ color: '#fff', fontSize: 26 }} />
          </div>
          <Title level={4} style={{ margin: '0 0 4px', letterSpacing: -0.3 }}>Create your account</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Join CardioVision as a medical professional</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 18, borderRadius: 8 }} />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Enter your full name' }]}>
            <Input prefix={<UserOutlined style={{ color: '#bbb' }} />} placeholder="Dr. Jane Smith" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<MailOutlined style={{ color: '#bbb' }} />} placeholder="doctor@hospital.com" />
          </Form.Item>

          <Form.Item name="license_number" label="Medical License Number" rules={[{ required: true, message: 'Enter your license number' }]}>
            <Input prefix={<IdcardOutlined style={{ color: '#bbb' }} />} placeholder="e.g. MD-2024-00123" />
          </Form.Item>

          <Form.Item name="specialty" label="Specialty">
            <Select placeholder="Select specialty (optional)">
              {SPECIALTIES.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            name="password" label="Password"
            rules={[
              { required: true, message: 'Enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="Min. 8 characters" />
          </Form.Item>

          <Form.Item name="confirm_password" label="Confirm Password" rules={[{ required: true, message: 'Confirm your password' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="Re-enter password" />
          </Form.Item>

          <Button
            type="primary" htmlType="submit" block
            loading={loading}
            style={{ height: 44, fontWeight: 700, borderRadius: 9, marginTop: 4 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </Form>

        <Divider style={{ margin: '22px 0' }} />
        <Text type="secondary" style={{ fontSize: 13, display: 'block', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </Text>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link to="/" style={{ fontSize: 12, color: '#9ca3af' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
