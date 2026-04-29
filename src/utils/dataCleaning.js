import Papa from 'papaparse'

const NUMERIC_COLUMNS = [
  'male',
  'age',
  'education',
  'currentSmoker',
  'cigsPerDay',
  'BPMeds',
  'prevalentStroke',
  'prevalentHyp',
  'diabetes',
  'totChol',
  'sysBP',
  'diaBP',
  'BMI',
  'heartRate',
  'glucose',
  'TenYearCHD',
]

function toNumber(value) {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = String(value).trim()
  if (
    normalized === '' ||
    normalized.toUpperCase() === 'NA' ||
    normalized.toUpperCase() === 'NAN' ||
    normalized.toUpperCase() === 'NULL'
  ) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeColumnName(columnName) {
  return String(columnName).replace(/^\uFEFF/, '').trim()
}

export function parseCsvText(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const cleanedRows = parsed.data.map((row, index) => {
    const nextRow = { id: index + 1 }
    for (const originalKey of Object.keys(row)) {
      const key = normalizeColumnName(originalKey)
      if (NUMERIC_COLUMNS.includes(key)) {
        nextRow[key] = toNumber(row[originalKey])
      } else {
        nextRow[key] = row[originalKey]
      }
    }
    return nextRow
  })

  return cleanedRows
}

export function getAvailableRanges(rows) {
  const ages = rows.map((row) => row.age).filter((value) => value !== null)
  if (ages.length === 0) {
    return { minAge: 0, maxAge: 100 }
  }

  return {
    minAge: Math.floor(Math.min(...ages)),
    maxAge: Math.ceil(Math.max(...ages)),
  }
}
