export const DIAG_CONFIG = {
  'Normal': {
    color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f', leftBar: '#52c41a',
    badgeColor: 'success',
    title: 'Normal Cardiac Function',
    subtitle: 'Ejection fraction is within the normal clinical range (≥ 55%).',
  },
  'Mild Dysfunction': {
    color: '#d46b08', bg: '#fff7e6', border: '#ffd591', leftBar: '#fa8c16',
    badgeColor: 'warning',
    title: 'Mild Systolic Dysfunction',
    subtitle: 'Mildly reduced ejection fraction. Clinical monitoring and follow-up recommended.',
  },
  'Moderate Dysfunction': {
    color: '#d4380d', bg: '#fff2e8', border: '#ffbb96', leftBar: '#ff7a45',
    badgeColor: 'orange',
    title: 'Moderate Systolic Dysfunction',
    subtitle: 'Moderately reduced ejection fraction. Prompt cardiology evaluation is recommended.',
  },
  'Severe Dysfunction': {
    color: '#cf1322', bg: '#fff1f0', border: '#ffa39e', leftBar: '#ff4d4f',
    badgeColor: 'error',
    title: 'Severe Systolic Dysfunction',
    subtitle: 'Severely reduced ejection fraction. Urgent clinical assessment required.',
  },
}

export const STAGE_CONFIG = [
  { key: 'segmentation',  label: 'Segmentation',  desc: 'nnU-Net detecting LV, Myocardium, and LA structures in every frame' },
  { key: 'measurement',   label: 'Measurements',  desc: 'Biplane Simpson volumes, ED/ES frame detection, clinical metric computation' },
  { key: 'cnn_inference', label: 'CNN Inference', desc: 'R(2+1)D-18 + Attention network predicting EF from raw video sequence' },
  { key: 'visualization', label: 'Visualization', desc: 'Generating annotated ED/ES frames and cardiac cycle GIF animations' },
  { key: 'done',          label: 'Complete',      desc: 'All outputs saved' },
]

export const MEASUREMENTS = [
  { key: 'ef_biplane',       label: 'EF (Biplane Simpson)',    unit: '%',   method: 'Biplane Simpson',       range: '≥ 55 %',       check: v => v >= 55 },
  { key: 'ef_cnn',           label: 'EF (CNN Model)',           unit: '%',   method: 'R(2+1)D-18 + Attention', range: '≥ 55 %',      check: v => v >= 55 },
  { key: 'ef_final',         label: 'EF — Final (Ensemble)',    unit: '%',   method: 'Ensemble average',      range: '≥ 55 %',       check: v => v >= 55, primary: true },
  { key: 'edv_ml',           label: 'End-Diastolic Volume',     unit: 'mL',  method: 'Biplane Simpson',       range: '50 – 167 mL',  check: v => v >= 50 && v <= 167 },
  { key: 'esv_ml',           label: 'End-Systolic Volume',      unit: 'mL',  method: 'Biplane Simpson',       range: '18 – 58 mL',   check: v => v >= 18 && v <= 58 },
  { key: 'sv_ml',            label: 'Stroke Volume',            unit: 'mL',  method: 'EDV − ESV',             range: '55 – 100 mL',  check: v => v >= 55 && v <= 100 },
  { key: 'lv_area_max_cm2',  label: 'LV Maximum Area',          unit: 'cm²', method: 'Pixel area × spacing',  range: '—',            check: null },
  { key: 'fac_pct',          label: 'Fractional Area Change',   unit: '%',   method: 'Area change ratio',     range: '≥ 50 %',       check: v => v >= 50 },
  { key: 'la_area_max_cm2',  label: 'LA Maximum Area',          unit: 'cm²', method: 'Pixel area × spacing',  range: '—',            check: null },
  { key: 'la_ef_pct',        label: 'Left Atrial EF',           unit: '%',   method: 'Area-based (LA)',       range: '≥ 50 %',       check: v => v >= 50 },
]

export function stageIndex(stage) {
  const i = STAGE_CONFIG.findIndex(s => s.key === stage)
  return i >= 0 ? i : 0
}

export function fmtDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + '  ·  '
      + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export function diagTagColor(diagnosis) {
  if (!diagnosis) return 'default'
  if (diagnosis === 'Normal') return 'success'
  if (diagnosis.includes('Mild')) return 'warning'
  if (diagnosis.includes('Moderate')) return 'orange'
  return 'error'
}
