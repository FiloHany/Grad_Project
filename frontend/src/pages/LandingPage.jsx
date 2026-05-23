import { Button, Tag, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HeartOutlined, SafetyOutlined, ThunderboltOutlined, BarChartOutlined, ArrowRightOutlined } from '@ant-design/icons'

const FEATURES = [
  {
    icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: 'Automated Analysis',
    desc: 'Upload NIfTI echocardiography sequences and get a full cardiac function report in under 2 minutes.',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
    title: 'Clinical Measurements',
    desc: 'Ejection Fraction, EDV, ESV, Stroke Volume, FAC, and LA-EF computed via Biplane Simpson method.',
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
    title: 'AI-Powered Diagnosis',
    desc: 'nnU-Net segmentation + R(2+1)D-18 CNN ensemble delivers accurate EF prediction and automatic diagnosis.',
  },
  {
    icon: <HeartOutlined style={{ fontSize: 28, color: '#eb2f96' }} />,
    title: 'Visual Reports',
    desc: 'Annotated ED/ES frames and full cardiac cycle GIF animations for every study.',
  },
]

const STEPS = [
  { n: '01', title: 'Upload Study',   desc: 'Upload the 4-Chamber and 2-Chamber NIfTI sequences for a patient.' },
  { n: '02', title: 'AI Processing',  desc: 'The pipeline segments the LV, computes volumes, and runs CNN inference.' },
  { n: '03', title: 'Clinical Report',desc: 'Receive EF, diagnosis, measurements, and annotated visualizations instantly.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, background: '#fff', zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg,#1677ff,#003eb3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HeartOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#111827', letterSpacing: -0.3 }}>
            CardioVision
          </span>
          <Tag color="blue" style={{ fontSize: 10, marginLeft: 4, fontWeight: 700 }}>v2.0</Tag>
        </div>
        <Space>
          <Button onClick={() => navigate('/login')} style={{ fontWeight: 600 }}>Log In</Button>
          <Button type="primary" onClick={() => navigate('/register')} style={{ fontWeight: 600 }}>
            Get Started
          </Button>
        </Space>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0d1f3c 0%, #0a1628 50%, #061020 100%)',
        padding: '100px 48px 90px', textAlign: 'center',
      }}>
        <Tag color="blue" style={{ marginBottom: 20, fontSize: 12, padding: '3px 14px', borderRadius: 20 }}>
          Cardiac Function Analysis Platform
        </Tag>
        <h1 style={{
          color: '#fff', fontSize: 52, fontWeight: 900, lineHeight: 1.15,
          margin: '0 auto 22px', maxWidth: 700, letterSpacing: -1.5,
        }}>
          AI-Powered <span style={{ color: '#40a9ff' }}>Echocardiography</span> Analysis
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.65)', fontSize: 18, lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 40px',
        }}>
          Upload NIfTI sequences. Get Ejection Fraction, diagnosis, and annotated visualizations in minutes — not hours.
        </p>
        <Space size={14}>
          <Button
            type="primary" size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/register')}
            style={{ height: 48, paddingInline: 32, fontSize: 15, fontWeight: 700, borderRadius: 10 }}
          >
            Start Free
          </Button>
          <Button
            size="large" ghost
            onClick={() => navigate('/login')}
            style={{ height: 48, paddingInline: 32, fontSize: 15, fontWeight: 600, borderRadius: 10, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
          >
            Log In
          </Button>
        </Space>

        {/* Stat bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 64, flexWrap: 'wrap' }}>
          {[['nnU-Net', 'Segmentation'], ['Biplane Simpson', 'Volume Method'], ['R(2+1)D-18', 'CNN Model'], ['< 2 min', 'Per Study']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: -0.5 }}>
            Everything you need for cardiac assessment
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, marginTop: 12 }}>
            Built for cardiologists. Powered by state-of-the-art deep learning.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: '28px 24px', borderRadius: 14,
              border: '1px solid #f0f0f0', background: '#fafbff',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 48px', background: '#f8faff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#111827', margin: '0 0 52px', letterSpacing: -0.5 }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1677ff,#003eb3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 6px 18px rgba(22,119,255,0.3)',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{s.n}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center', background: 'linear-gradient(135deg,#0d1f3c,#0a1628)' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: -0.5 }}>
          Ready to analyse your first study?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 36 }}>
          Register your doctor account in 30 seconds — no credit card required.
        </p>
        <Button
          type="primary" size="large"
          onClick={() => navigate('/register')}
          icon={<ArrowRightOutlined />}
          style={{ height: 50, paddingInline: 40, fontSize: 16, fontWeight: 700, borderRadius: 10 }}
        >
          Create Account
        </Button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 700, color: '#374151' }}>CardioVision</span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>v2.0.0</span>
        </div>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>
          Graduation Project · AI-Powered Cardiac Ultrasound Analysis
        </span>
      </footer>

    </div>
  )
}
