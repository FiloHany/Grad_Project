import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginDoctor, registerDoctor, getMe } from '../api/client'

const AuthContext = createContext(null)

const TOKEN_KEY  = 'cv_token'
const DOCTOR_KEY = 'cv_doctor'

export function AuthProvider({ children }) {
  const [doctor,  setDoctor]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(DOCTOR_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(true)   // true while we verify the stored token

  // On mount: verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    getMe()
      .then(d => { setDoctor(d); localStorage.setItem(DOCTOR_KEY, JSON.stringify(d)) })
      .catch(() => { _clearStorage() })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await loginDoctor(email, password)
    localStorage.setItem(TOKEN_KEY,  res.access_token)
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(res.doctor))
    setDoctor(res.doctor)
    return res.doctor
  }, [])

  const register = useCallback(async (data) => {
    const res = await registerDoctor(data)
    localStorage.setItem(TOKEN_KEY,  res.access_token)
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(res.doctor))
    setDoctor(res.doctor)
    return res.doctor
  }, [])

  const logout = useCallback(() => {
    _clearStorage()
    setDoctor(null)
  }, [])

  return (
    <AuthContext.Provider value={{ doctor, loading, login, register, logout, isAuthenticated: !!doctor }}>
      {children}
    </AuthContext.Provider>
  )
}

function _clearStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(DOCTOR_KEY)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
