import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address.')
    }
    setLoading(true)
    // Simulate API delay (no real email server)
    await new Promise(r => setTimeout(r, 1400))
    localStorage.setItem('cv_resetEmail', email)
    localStorage.setItem('cv_resetToken', Math.random().toString(36).slice(2))
    setLoading(false)
    setSuccess(true)
  }

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
            {success ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {success ? `Instructions sent to ${email}` : 'Enter your email to receive reset instructions'}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/60 dark:border-gray-700/60">

          {success ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                We've sent password reset instructions to
              </p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-6">{email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                Click the link in the email to reset your password. The link expires in 24 hours.
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/reset-password')}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30">
                  Continue to Reset Password
                </button>
                <button onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400 transition">
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Reset Password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="doctor@hospital.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Reset Link</>
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
