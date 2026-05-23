import { useState } from 'react'
import { Form, Input, Button, Typography, Alert, Divider, App as AntApp } from 'antd'
import { MailOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const { message }  = AntApp.useApp()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const from = location.state?.from?.pathname || '/app'

  async function handleSubmit({ email, password }) {
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      message.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
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
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 18,
        padding: '44px 40px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 13,
            background: 'linear-gradient(135deg,#1677ff,#003eb3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 6px 18px rgba(22,119,255,0.35)',
          }}>
            <HeartOutlined style={{ color: '#fff', fontSize: 26 }} />
          </div>
          <Title level={4} style={{ margin: '0 0 4px', letterSpacing: -0.3 }}>Welcome back</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Sign in to CardioVision</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
        )}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false} size="large">
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Enter your email' }]}>
            <Input prefix={<MailOutlined style={{ color: '#bbb' }} />} placeholder="doctor@hospital.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="••••••••" />
          </Form.Item>
          <Button
            type="primary" htmlType="submit" block
            loading={loading} size="large"
            style={{ height: 44, fontWeight: 700, borderRadius: 9, marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Form>

        <Divider style={{ margin: '22px 0' }} />
        <Text type="secondary" style={{ fontSize: 13, display: 'block', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </Text>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link to="/" style={{ fontSize: 12, color: '#9ca3af' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
