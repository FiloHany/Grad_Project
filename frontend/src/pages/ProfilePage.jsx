import { useState, useMemo } from 'react'
import {
  Mail, Briefcase, Calendar, Activity, FileText,
  Lock, LogOut, Edit3, Save, X,
  Shield, CheckCircle, AlertCircle, Heart,
  LayoutDashboard, Plus, History, TrendingUp,
  Award, Clock,
} from 'lucide-react'
import { Tag } from 'antd'
import { useAuth }   from '../context/AuthContext'
import { updateProfile } from '../api/client'
import { useNavigate }   from 'react-router-dom'
import { useTheme }      from '../context/ThemeContext'
import { diagTagColor, fmtDate } from '../constants'

const SPECIALTIES = [
  'Cardiology', 'Echocardiography', 'Cardiac Surgery',
  'Internal Medicine', 'Radiology', 'General Practice', 'Other',
]

// ─── sub-components ──────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, iconColor, label, value, isDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: isDark ? `${iconColor}18` : `${iconColor}12`,
        border: `1px solid ${iconColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: isDark ? '#475569' : '#94a3b8',
          marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 13.5, fontWeight: 600,
          color: isDark ? '#e2e8f0' : '#1e293b',
        }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function StatBadge({ value, label, color, isDark }) {
  return (
    <div style={{
      textAlign: 'center', padding: '16px 12px',
      background: isDark ? `${color}0d` : `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: 12,
      flex: 1,
    }}>
      <div style={{
        fontSize: 28, fontWeight: 900, color,
        lineHeight: 1, marginBottom: 4,
        textShadow: isDark ? `0 0 20px ${color}40` : 'none',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProfilePage({ jobs = [], onNavigate }) {
  const { doctor, logout } = useAuth()
  const navigate           = useNavigate()
  const { theme }          = useTheme()
  const isDark             = theme === 'dark'

  const [isEditing, setIsEditing] = useState(false)
  const [editForm,  setEditForm]  = useState({ full_name: doctor?.full_name || '', specialty: doctor?.specialty || '' })
  const [saving,    setSaving]    = useState(false)
  const [feedback,  setFeedback]  = useState(null)

  const totalJobs  = jobs.length
  const completed  = jobs.filter(j => j.status === 'completed').length
  const failed     = jobs.filter(j => j.status === 'failed').length
  const avgEF      = useMemo(() => {
    const vals = jobs.filter(j => j.measurements?.ef_final != null).map(j => j.measurements.ef_final)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  }, [jobs])

  const recentJobs = useMemo(() =>
    [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)
  , [jobs])

  const memberSince = doctor?.created_at
    ? new Date(doctor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  async function handleSave() {
    if (!editForm.full_name.trim()) return setFeedback({ type: 'error', msg: 'Name is required.' })
    setSaving(true); setFeedback(null)
    try {
      await updateProfile({ full_name: editForm.full_name.trim(), specialty: editForm.specialty || null })
      setFeedback({ type: 'success', msg: 'Profile updated successfully!' })
      setIsEditing(false)
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Update failed.' })
    } finally { setSaving(false) }
  }

  function handleLogout() { logout(); navigate('/') }
  if (!doctor) return null

  const initials   = doctor.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const cardBg     = isDark ? '#0f172a' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0'
  const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)'
  const textMain   = isDark ? '#f1f5f9' : '#0f172a'
  const textSub    = isDark ? '#64748b' : '#94a3b8'

  const sharedCard = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 16,
    boxShadow: cardShadow,
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Feedback toast ── */}
      {feedback && (
        <div style={{
          marginBottom: 20, padding: '14px 18px',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
          background: feedback.type === 'success'
            ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4')
            : (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'),
          border: `1px solid ${feedback.type === 'success'
            ? (isDark ? 'rgba(34,197,94,0.25)' : '#bbf7d0')
            : (isDark ? 'rgba(239,68,68,0.25)' : '#fecaca')}`,
          color: feedback.type === 'success'
            ? (isDark ? '#4ade80' : '#16a34a')
            : (isDark ? '#f87171' : '#dc2626'),
        }}>
          {feedback.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{feedback.msg}</span>
        </div>
      )}

      {/* ═══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div style={{
        ...sharedCard,
        padding: 0,
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        {/* Banner gradient */}
        <div style={{
          height: 120,
          background: isDark
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decorations */}
          {[
            { size: 180, x: -40, y: -60, op: 0.06 },
            { size: 120, x: '60%', y: -30, op: 0.05 },
            { size: 80,  x: '85%', y: 20,  op: 0.08 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', left: c.x, top: c.y,
              width: c.size, height: c.size, borderRadius: '50%',
              background: `rgba(255,255,255,${c.op})`,
            }} />
          ))}
          {/* Role chip */}
          <div style={{
            position: 'absolute', top: 16, right: 20,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
            letterSpacing: 0.6, backdropFilter: 'blur(8px)',
          }}>
            MEDICAL PROFESSIONAL
          </div>
        </div>

        {/* Profile row — avatar overlaps banner */}
        <div style={{ padding: '0 28px 24px', marginTop: -36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 900, color: '#fff',
                border: `3px solid ${cardBg}`,
                boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
                letterSpacing: -1,
              }}>
                {initials}
              </div>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#22c55e',
                border: `2px solid ${cardBg}`,
                boxShadow: '0 0 8px rgba(34,197,94,0.7)',
              }} />
            </div>

            {/* Name + specialty */}
            <div style={{ flex: 1, paddingBottom: 4 }}>
              {isEditing ? (
                <input
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  style={{
                    fontSize: 22, fontWeight: 800,
                    background: isDark ? '#1e293b' : '#f8fafc',
                    border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: 8, padding: '4px 10px',
                    color: textMain, outline: 'none',
                    width: '100%', maxWidth: 300,
                  }}
                />
              ) : (
                <div style={{ fontSize: 22, fontWeight: 800, color: textMain, marginBottom: 2 }}>
                  {doctor.full_name}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8' }}>
                {doctor.specialty || 'Medical Professional'}
              </div>
            </div>

            {/* Edit controls */}
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setFeedback(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave} disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      background: saving ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)',
                      border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                    }}
                  >
                    <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditForm({ full_name: doctor.full_name, specialty: doctor.specialty || '' }); setFeedback(null) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      background: isDark ? '#1e293b' : '#f1f5f9',
                      border: `1px solid ${cardBorder}`,
                      color: textMain, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <X size={13} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN GRID ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── LEFT column ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <StatBadge value={totalJobs}  label="Total Studies"  color="#818cf8" isDark={isDark} />
            <StatBadge value={completed}  label="Completed"      color="#4ade80" isDark={isDark} />
            <StatBadge value={failed}     label="Failed"         color="#f87171" isDark={isDark} />
            {avgEF !== null && (
              <StatBadge value={`${avgEF}%`} label="Average EF"  color="#f472b6" isDark={isDark} />
            )}
          </div>

          {/* Account info */}
          <div style={{ ...sharedCard, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
              Account Information
            </div>
            <div style={{ fontSize: 13, color: textSub, marginBottom: 16 }}>
              Your registered credentials and profile details
            </div>

            <InfoRow icon={Mail}     iconColor="#818cf8" label="Email Address"   value={doctor.email}                           isDark={isDark} />
            <InfoRow icon={Briefcase} iconColor="#a78bfa" label="Specialty"
              value={
                isEditing
                  ? <select
                      value={editForm.specialty}
                      onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))}
                      style={{
                        background: isDark ? '#1e293b' : '#f8fafc',
                        border: `1px solid ${cardBorder}`,
                        borderRadius: 6, padding: '4px 8px',
                        color: textMain, fontSize: 13, outline: 'none',
                      }}
                    >
                      <option value="">Not specified</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  : (doctor.specialty || 'Not specified')
              }
              isDark={isDark}
            />
            <InfoRow icon={Shield}   iconColor="#34d399" label="License Number"  value={doctor.license_number || '—'}           isDark={isDark} />
            <InfoRow icon={Calendar} iconColor="#60a5fa" label="Member Since"    value={memberSince}                            isDark={isDark} />
          </div>

          {/* Security */}
          <div style={{ ...sharedCard, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isDark ? 'rgba(251,146,60,0.15)' : 'rgba(251,146,60,0.1)',
                border: '1px solid rgba(251,146,60,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={15} color="#fb923c" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>Security</div>
                <div style={{ fontSize: 12, color: textSub }}>Account protection settings</div>
              </div>
            </div>

            <div style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: `1px solid ${cardBorder}`,
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {[
                'Password hashed with bcrypt — credentials are secure.',
                'JWT tokens expire in 24 hours — automatic session protection.',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CheckCircle size={11} color="#4ade80" />
                  </div>
                  <span style={{ fontSize: 12.5, color: isDark ? '#94a3b8' : '#475569' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT column ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div style={{ ...sharedCard, padding: '20px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Dashboard',    icon: LayoutDashboard, key: 'dashboard',    color: '#818cf8', desc: 'Overview & analytics'   },
                { label: 'New Analysis', icon: Plus,            key: 'new-analysis', color: '#4ade80', desc: 'Upload & analyze'        },
                { label: 'Study History',icon: History,         key: 'history',      color: '#60a5fa', desc: 'Browse all studies'      },
              ].map(({ label, icon: Icon, key, color, desc }) => (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: isDark ? `${color}0d` : `${color}08`,
                    border: `1px solid ${color}25`,
                    cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'left', width: '100%',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? `${color}18` : `${color}14`}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? `${color}0d` : `${color}08`}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isDark ? `${color}20` : `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>{label}</div>
                    <div style={{ fontSize: 11, color: textSub, marginTop: 1 }}>{desc}</div>
                  </div>
                </button>
              ))}

              <div style={{ height: 1, background: cardBorder, margin: '4px 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  background: isDark ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.05)'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <LogOut size={15} color="#ef4444" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Sign Out</div>
                  <div style={{ fontSize: 11, color: textSub, marginTop: 1 }}>End your session</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Studies */}
          <div style={{ ...sharedCard, padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Recent Studies
              </div>
              {recentJobs.length > 0 && (
                <button
                  onClick={() => onNavigate('history')}
                  style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  View all →
                </button>
              )}
            </div>

            {recentJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: textSub, fontSize: 12 }}>
                <Activity size={28} style={{ opacity: 0.2, margin: '0 auto 8px', display: 'block' }} />
                No studies yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentJobs.map(j => (
                  <div key={j.job_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${cardBorder}`,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: {
                        completed: '#4ade80', running: '#818cf8',
                        queued: '#fbbf24', failed: '#f87171',
                      }[j.status] || '#64748b',
                      boxShadow: j.status === 'running' ? '0 0 6px #818cf8' : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: textMain, truncate: true }}>
                        {j.patient_name || 'Anonymous'}
                      </div>
                      <div style={{ fontSize: 10.5, color: textSub, marginTop: 1 }}>
                        {fmtDate(j.created_at).split('·')[0].trim()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      {j.measurements?.ef_final != null && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#818cf8' }}>
                          {j.measurements.ef_final.toFixed(1)}%
                        </span>
                      )}
                      <Tag
                        color={{ completed: 'success', running: 'processing', queued: 'default', failed: 'error' }[j.status]}
                        style={{ fontSize: 9.5, borderRadius: 20, padding: '0 6px', lineHeight: '16px', margin: 0 }}
                      >
                        {j.status}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
