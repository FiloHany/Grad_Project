import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Stethoscope, AlertCircle, CheckCircle, Eye, EyeOff, Sun, Moon, IdCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const SPECIALTIES = [
  'Cardiology', 'Echocardiography', 'Cardiac Surgery',
  'Internal Medicine', 'Radiology', 'General Practice', 'Other',
]

function checkPasswordStrength(password) {
  const errors = []
  if (password.length < 8)        errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password))    errors.push('One uppercase letter')
  if (!/[0-9]/.test(password))    errors.push('One number')

  const isValid = errors.length === 0
  const strength = password.length >= 12 && isValid ? 'strong'
    : password.length >= 8 && errors.length <= 1   ? 'medium'
    : 'weak'

  return { errors, isValid, strength }
}

export default function RegisterPage() {
  const { register }           = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate               = useNavigate()

  const [form, setForm] = useState({
    full_name: '', license_number: '', email: '',
    password: '', confirmPassword: '', specialty: '',
  })
  const [errors,             setErrors]             = useState({})
  const [loading,            setLoading]            = useState(false)
  const [success,            setSuccess]            = useState(false)
  const [showPassword,       setShowPassword]       = useState(false)
  const [showConfirm,        setShowConfirm]        = useState(false)
  const [passwordStrength,   setPasswordStrength]   = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'password') setPasswordStrength(value ? checkPasswordStrength(value) : null)
  }

  function validate() {
    const e = {}
    if (!form.full_name.trim() || form.full_name.trim().length < 3) e.full_name = 'Full name must be at least 3 characters'
    if (!form.license_number.trim()) e.license_number = 'License number is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) {
      e.password = 'Password is required'
    } else {
      const s = checkPasswordStrength(form.password)
      if (!s.isValid) e.password = s.errors[0]
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      await register({
        full_name:      form.full_name.trim(),
        email:          form.email.trim(),
        password:       form.password,
        license_number: form.license_number.trim(),
        specialty:      form.specialty || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/app'), 1500)
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  function StrengthBar() {
    if (!passwordStrength || !form.password) return null
    const colorClass = passwordStrength.strength === 'strong' ? 'bg-green-500'
      : passwordStrength.strength === 'medium' ? 'bg-yellow-500'
      : 'bg-red-500'
    const widthClass = passwordStrength.strength === 'strong' ? 'w-full'
      : passwordStrength.strength === 'medium' ? 'w-2/3'
      : 'w-1/3'
    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div className={`${colorClass} ${widthClass} transition-all duration-300`} />
        </div>
        <p className={`text-xs mt-1 ${passwordStrength.isValid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
          Strength: <span className="font-semibold capitalize">{passwordStrength.strength}</span>
        </p>
        {passwordStrength.errors.length > 0 && (
          <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
            {passwordStrength.errors.map((err, i) => (
              <li key={i} className="flex items-start gap-1"><span className="text-red-400">•</span> {err}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Account Created!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Welcome to CardioVision.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transform transition border border-gray-200 dark:border-gray-700 z-50"
      >
        {theme === 'dark'
          ? <Sun className="w-5 h-5 text-yellow-400" />
          : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700 my-8">
        {/* Logo & title */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="CardioVision" className="mx-auto w-16 h-16 mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Create Your Account</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Join CardioVision as a medical professional</p>
        </div>

        {/* Security notice */}
        <div className="mb-5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            🔒 <strong>Secure:</strong> Passwords are hashed with bcrypt and never stored in plain text.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <Field label="Full Name *" error={errors.full_name}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Dr. Ahmed Hassan"
                className={inputCls(errors.full_name)} />
            </div>
          </Field>

          {/* License number */}
          <Field label="License Number *" error={errors.license_number}>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="license_number" value={form.license_number} onChange={handleChange} placeholder="e.g. MD-2024-00123"
                className={inputCls(errors.license_number)} />
            </div>
          </Field>

          {/* Email */}
          <Field label="Email Address *" error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com"
                className={inputCls(errors.email)} />
            </div>
          </Field>

          {/* Specialty */}
          <Field label="Specialty">
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select name="specialty" value={form.specialty} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none">
                <option value="">Select specialty (optional)</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Field>

          {/* Password */}
          <Field label="Password *" error={errors.password}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                className={inputCls(errors.password) + ' pr-12'} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <StrengthBar />
          </Field>

          {/* Confirm password */}
          <Field label="Confirm Password *" error={errors.confirmPassword}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••"
                className={inputCls(errors.confirmPassword) + ' pr-12'} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </Field>

          {/* Submit error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading
              ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Creating Account…</>
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Sign In</Link>
          </p>
          <Link to="/" className="block text-xs text-gray-400 hover:text-indigo-500 transition">← Back to home</Link>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  )
}

function inputCls(hasError) {
  return `w-full pl-10 py-3 rounded-lg border ${
    hasError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`
}
