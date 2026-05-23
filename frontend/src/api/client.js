const TOKEN_KEY = 'cv_token'

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(url, options = {}) {
  const headers = { ...authHeaders(), ...options.headers }
  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    // Token expired — clear storage and redirect to login
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('cv_doctor')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginDoctor(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Login failed')
  }
  return res.json()
}

export async function registerDoctor(data) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Registration failed')
  }
  return res.json()
}

export async function getMe() {
  return request('/api/auth/me')
}

// ── Studies & Jobs ────────────────────────────────────────────────────────────

export async function uploadStudy(file4ch, file2ch, patientName, patientId) {
  const fd = new FormData()
  fd.append('file_4ch', file4ch)
  fd.append('file_2ch', file2ch)
  if (patientName) fd.append('patient_name', patientName)
  if (patientId)   fd.append('patient_id',   patientId)
  return request('/api/studies/upload', { method: 'POST', body: fd })
}

export async function analyzeStudy(studyId) {
  return request(`/api/studies/${studyId}/analyze`, { method: 'POST' })
}

export async function getJob(jobId) {
  return request(`/api/jobs/${jobId}`)
}

export async function getReport(jobId) {
  return request(`/api/jobs/${jobId}/report`)
}

export async function listJobs() {
  try { return await request('/api/jobs') }
  catch { return [] }
}

export async function checkHealth() {
  try { const r = await fetch('/health'); return r.ok }
  catch { return false }
}
