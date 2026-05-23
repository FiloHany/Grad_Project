import { useState } from 'react'
import {
  User, Mail, Briefcase, Calendar, Activity, FileText,
  Lock, LogOut, Edit3, Save, X, Eye, EyeOff, Shield,
  CheckCircle, AlertCircle, Heart, BarChart3,
} from 'lucide-react'
import { useAuth }   from '../context/AuthContext'
import { updateProfile } from '../api/client'
import { useNavigate }   from 'react-router-dom'

const SPECIALTIES = [
  'Cardiology', 'Echocardiography', 'Cardiac Surgery',
  'Internal Medicine', 'Radiology', 'General Practice', 'Other',
]

export default function ProfilePage({ jobs = [], onNavigate }) {
  const { doctor, logout } = useAuth()
  const navigate           = useNavigate()

  const [isEditing, setIsEditing]   = useState(false)
  const [editForm,  setEditForm]    = useState({ full_name: doctor?.full_name || '', specialty: doctor?.specialty || '' })
  const [saving,    setSaving]      = useState(false)
  const [feedback,  setFeedback]    = useState(null)   // { type: 'success'|'error', msg }

  const totalJobs     = jobs.length
  const completed     = jobs.filter(j => j.status === 'completed').length
  const avgEF         = (() => {
    const vals = jobs.filter(j => j.measurements?.ef_final != null).map(j => j.measurements.ef_final)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  })()

  const memberSince = doctor?.created_at
    ? new Date(doctor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  async function handleSave() {
    if (!editForm.full_name.trim()) return setFeedback({ type: 'error', msg: 'Name is required.' })
    setSaving(true)
    setFeedback(null)
    try {
      await updateProfile({ full_name: editForm.full_name.trim(), specialty: editForm.specialty || null })
      setFeedback({ type: 'success', msg: 'Profile updated successfully!' })
      setIsEditing(false)
      // Reload page to refresh doctor in context
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Update failed.' })
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() { logout(); navigate('/') }

  if (!doctor) return null

  const initials = doctor.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="max-w-5xl mx-auto fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-1">
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account settings and view your statistics</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          feedback.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{feedback.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Profile card ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                {initials}
              </div>

              {/* Name + edit controls */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className="text-2xl font-bold w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none mb-1"
                    placeholder="Your full name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">{doctor.full_name}</h2>
                )}
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-0.5">
                  {doctor.specialty || 'Medical Professional'}
                </p>
              </div>

              {/* Edit / Save / Cancel */}
              <div className="flex gap-2 flex-shrink-0">
                {!isEditing ? (
                  <button onClick={() => { setIsEditing(true); setFeedback(null) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditForm({ full_name: doctor.full_name, specialty: doctor.specialty || '' }); setFeedback(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={Mail} iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600 dark:text-indigo-400"
                label="Email" value={doctor.email} />

              <InfoRow icon={Briefcase} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400"
                label="Specialty"
                value={
                  isEditing
                    ? <select value={editForm.specialty} onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))}
                        className="font-semibold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                        <option value="">Not specified</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    : (doctor.specialty || 'Not specified')
                }
              />

              <InfoRow icon={Shield} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
                label="License Number" value={doctor.license_number || '—'} />

              <InfoRow icon={Calendar} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400"
                label="Member Since" value={memberSince} />
            </div>
          </div>

          {/* Security card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Security</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account protection settings</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Password hashed with bcrypt — your credentials are secure.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>JWT tokens expire after 24 hours — automatic session security.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Stats + Quick Actions ───────────────────────────── */}
        <div className="space-y-6">

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Your Statistics
            </h3>
            <div className="space-y-3">
              <StatItem icon={FileText} bg="bg-indigo-50 dark:bg-indigo-900/20" color="text-indigo-600 dark:text-indigo-400"
                label="Total Studies" value={totalJobs} />
              <StatItem icon={CheckCircle} bg="bg-green-50 dark:bg-green-900/20" color="text-green-600 dark:text-green-400"
                label="Completed" value={completed} />
              {avgEF !== null && (
                <StatItem icon={Heart} bg="bg-pink-50 dark:bg-pink-900/20" color="text-pink-600 dark:text-pink-400"
                  label="Avg. EF" value={`${avgEF}%`} />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <ActionBtn label="Go to Dashboard" onClick={() => onNavigate('dashboard')}
                className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300" />
              <ActionBtn label="New Analysis" onClick={() => onNavigate('new-analysis')}
                className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" />
              <ActionBtn label="Study History" onClick={() => onNavigate('history')}
                className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300" />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors text-sm font-semibold">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function StatItem({ icon: Icon, bg, color, label, value }) {
  return (
    <div className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      </div>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

function ActionBtn({ label, onClick, className }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors text-sm font-semibold text-left ${className}`}>
      {label}
    </button>
  )
}
