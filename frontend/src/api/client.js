async function request(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

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
