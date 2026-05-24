import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { resetPassword } from '../api/client'

function strengthLevel(pwd) {
  let score = 0
  if (pwd.length >= 8)           score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[a-z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPwd,      setShowPwd]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [email,        setEmail]        = useState('')

  useEffect(() => {
    const resetEmail = localStorage.getItem('cv_resetEmail')
    const resetToken = localStorage.getItem('cv_resetToken')
    if (!resetEmail || !resetToken) {
      navigate('/forgot-password')
    } else {
      setEmail(resetEmail)
    }
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8)     return setError('Password must be at least 8 characters.')
    if (!/[A-Z]/.test(password)) return setError('Must include at least one uppercase letter.')
    if (!/[0-9]/.test(password)) return setError('Must include at least one number.')
    if (password !== confirm)    return setError('Passwords do not match.')

    setLoading(true)
    try {
      await resetPassword(email, password)
      localStorage.removeItem('cv_resetEmail')
      localStorage.removeItem('cv_resetToken')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = strengthLevel(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'][strength]

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden
      bg-gradient-to-br from-indigo-50 via-white to-purple-50
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`}>

      {/* Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-indigo-400/20 dark:bg-indigo-800/20 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-purple-400/20 dark:bg-purple-800/20 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Theme toggle */}
      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="fixed top-6 right-6 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform z-50">
        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full" />
            <img src="/logo.png" alt="CardioVision" className="mx-auto w-16 h-16 mb-4 relative z-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {email ? `Create a new password for ${email}` : 'Create a new secure password'}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/60 dark:border-gray-700/60">

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Password Reset!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Your password has been successfully reset.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Redirecting to login in 3 seconds…</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30">
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Min. 8 chars with uppercase and numbers
                  </p>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p className={`text-xs mt-1 font-medium ${password === confirm ? 'text-green-500' : 'text-red-500'}`}>
                      {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Resetting…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Reset Password</>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
