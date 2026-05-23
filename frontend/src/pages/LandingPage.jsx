import { useNavigate } from 'react-router-dom'
import {
  Heart, Activity, Brain, Shield, BarChart3, Users,
  ArrowRight, CheckCircle, Sun, Moon, Upload, FileText, Zap,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'nnU-Net segmentation + R(2+1)D-18 CNN ensemble for accurate echocardiography interpretation',
  },
  {
    icon: Activity,
    title: 'Real-time Results',
    description: 'Ejection Fraction, EDV, ESV, Stroke Volume, FAC and LA-EF computed via Biplane Simpson method',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Reports',
    description: 'Annotated ED/ES frames and full cardiac cycle GIF animations with detailed analytics',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'JWT-authenticated accounts with doctor-scoped data — only you see your studies',
  },
  {
    icon: Users,
    title: 'Multi-User Platform',
    description: 'Separate accounts for every clinician with persistent study history across sessions',
  },
  {
    icon: Heart,
    title: 'Clinical Excellence',
    description: 'Designed by cardiologists for cardiologists — NIfTI input, clinical-grade output',
  },
]

const BENEFITS = [
  'Reduce analysis time by 80%',
  'Improve diagnostic accuracy',
  'Streamline clinical workflows',
  'Access comprehensive study history',
  'Generate detailed clinical reports',
  'Automatic cardiac dysfunction classification',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Sticky Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full" />
              <img src="/logo.png" alt="CardioVision Logo" className="w-11 h-11 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                CardioVision
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cardiac AI Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 transform transition-all duration-200"
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-5 py-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
            <Activity className="w-4 h-4" />
            <span>Next-Generation Cardiac Imaging AI</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            AI-Powered
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mt-2">
              Echocardiography Analysis
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload NIfTI sequences. Get Ejection Fraction, diagnosis, and annotated visualisations in minutes — not hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg flex items-center gap-2 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:-translate-y-1 shadow-lg"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              ['nnU-Net', 'Segmentation Model'],
              ['Biplane', 'Simpson Method'],
              ['< 2 min', 'Per Study'],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{v}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">
            FEATURES
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Powerful Tools for Clinical Excellence
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Everything you need for efficient echocardiography analysis in one platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6">
              BENEFITS
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Transform Your Clinical Practice
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              CardioVision empowers healthcare professionals with advanced AI technology to deliver faster, more accurate cardiac assessments.
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-200 text-lg font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">
            HOW IT WORKS
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Simple, Fast, Accurate
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Get AI-powered cardiac analysis in three easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: 1, Icon: Upload,   title: 'Upload Study',    desc: 'Upload 4-Chamber and 2-Chamber NIfTI sequences securely' },
            { n: 2, Icon: Brain,    title: 'AI Processing',   desc: 'The pipeline segments the LV, computes volumes and runs CNN inference' },
            { n: 3, Icon: FileText, title: 'Clinical Report', desc: 'Receive EF, diagnosis, measurements and annotated visualisations' },
          ].map(({ n, Icon, title, desc }, i, arr) => (
            <div key={n} className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {n}
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">{title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{desc}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <Zap className="w-5 h-5" />
            Get Started Now
          </button>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-2xl mx-auto">
              Register your doctor account in 30 seconds — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold text-lg shadow-2xl hover:-translate-y-1"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-indigo-700/50 backdrop-blur-sm text-white rounded-xl hover:bg-indigo-800/50 transition-all duration-200 font-bold text-lg border-2 border-white/30 hover:border-white/50 hover:-translate-y-1"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="CardioVision" className="w-11 h-11" />
                <span className="text-2xl font-bold text-white">CardioVision</span>
              </div>
              <p className="text-gray-400 mb-2 max-w-md">
                AI-Powered Cardiac Imaging Analysis. Graduation Project — real ML pipeline for echocardiography assessment.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/register')} className="text-gray-400 hover:text-white transition">Get Started</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition">Sign In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Graduation Project</span></li>
                <li><span className="text-gray-400">AI / ML Team</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2025 CardioVision. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-2 md:mt-0">AI-Powered Cardiac Ultrasound Analysis</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
