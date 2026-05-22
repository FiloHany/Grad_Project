import { useState, useRef } from 'react'
import { Result, Button } from 'antd'
import UploadForm from '../components/analysis/UploadForm'
import AnalysisProgress from '../components/analysis/AnalysisProgress'
import ReportView from './ReportView'
import { getJob, getReport } from '../api/client'

export default function NewAnalysis({ onJobsRefresh, onViewHistory }) {
  const [state,     setState]     = useState('upload')  // upload | analyzing | results | error
  const [jobStatus, setJobStatus] = useState(null)
  const [report,    setReport]    = useState(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const pollRef = useRef(null)

  function startPolling(jobId) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const s = await getJob(jobId)
        setJobStatus(s)
        if (s.status === 'completed') {
          clearInterval(pollRef.current)
          try {
            const rpt = await getReport(jobId)
            setReport(rpt)
            setState('results')
          } catch {
            setErrorMsg('Analysis completed but the report could not be loaded.')
            setState('error')
          }
          onJobsRefresh()
        } else if (s.status === 'failed') {
          clearInterval(pollRef.current)
          setErrorMsg(s.error_message || 'Analysis failed. Please try again.')
          setState('error')
        }
      } catch { /* network hiccup, retry next tick */ }
    }, 3000)
  }

  function handleAnalysisStart(jobId) {
    setState('analyzing')
    startPolling(jobId)
  }

  function handleReset() {
    if (pollRef.current) clearInterval(pollRef.current)
    setState('upload')
    setJobStatus(null)
    setReport(null)
    setErrorMsg('')
  }

  if (state === 'upload')    return <UploadForm onAnalysisStart={handleAnalysisStart} />
  if (state === 'analyzing') return <AnalysisProgress jobStatus={jobStatus} onCancel={handleReset} />
  if (state === 'results')   return <ReportView report={report} onNewAnalysis={handleReset} onViewHistory={onViewHistory} />
  if (state === 'error') {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto' }}>
        <Result
          status="error"
          title="Analysis Failed"
          subTitle={errorMsg}
          extra={[
            <Button type="primary" key="retry" onClick={handleReset}>Try Again</Button>,
          ]}
        />
      </div>
    )
  }
  return null
}
