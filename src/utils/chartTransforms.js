import { mean, percentage } from './stats'

function validRows(rows, key) {
  return rows.filter((row) => {
    const value = row[key]
    return value !== null && value !== undefined && Number.isFinite(value)
  })
}

export function chdRateByAgeGroup(rows) {
  const bins = [
    { label: '30-39', min: 30, max: 39 },
    { label: '40-49', min: 40, max: 49 },
    { label: '50-59', min: 50, max: 59 },
    { label: '60-69', min: 60, max: 69 },
    { label: '70+', min: 70, max: Number.POSITIVE_INFINITY },
  ]

  return bins.map((bin) => {
    const group = rows.filter(
      (row) =>
        row.age !== null && row.age >= bin.min && row.age <= bin.max,
    )

    return {
      ageGroup: bin.label,
      chdRate: percentage(group, (row) => row.TenYearCHD === 1),
      sampleSize: group.length,
    }
  })
}

export function chdRateBySmoking(rows) {
  const smokers = rows.filter((row) => row.currentSmoker === 1)
  const nonSmokers = rows.filter((row) => row.currentSmoker === 0)

  return [
    {
      group: 'Non-smoker',
      chdRate: percentage(nonSmokers, (row) => row.TenYearCHD === 1),
      sampleSize: nonSmokers.length,
    },
    {
      group: 'Smoker',
      chdRate: percentage(smokers, (row) => row.TenYearCHD === 1),
      sampleSize: smokers.length,
    },
  ]
}

export function cholesterolByChd(rows) {
  return validRows(rows, 'totChol').map((row) => ({
    outcome: row.TenYearCHD === 1 ? 'CHD' : 'No CHD',
    totChol: row.totChol,
  }))
}

export function bpScatter(rows) {
  return rows
    .filter(
      (row) =>
        row.sysBP !== null &&
        row.diaBP !== null &&
        row.TenYearCHD !== null,
    )
    .map((row) => ({
      sysBP: row.sysBP,
      diaBP: row.diaBP,
      outcome: row.TenYearCHD === 1 ? 'CHD' : 'No CHD',
    }))
}

export function bmiGlucoseScatter(rows) {
  return rows
    .filter((row) => row.BMI !== null && row.glucose !== null)
    .map((row) => ({
      BMI: row.BMI,
      glucose: row.glucose,
      outcome: row.TenYearCHD === 1 ? 'CHD' : 'No CHD',
    }))
}

export function riskFactorBins(rows, factorKey) {
  const values = rows.map((row) => row[factorKey]).filter((v) => v !== null)
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = 6
  const width = (max - min) / binCount || 1

  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * width
    const end = index === binCount - 1 ? max : start + width
    const inBin = rows.filter((row) => {
      const value = row[factorKey]
      if (value === null) return false
      if (index === binCount - 1) return value >= start && value <= end
      return value >= start && value < end
    })

    return {
      range: `${start.toFixed(1)}-${end.toFixed(1)}`,
      chdRate: percentage(inBin, (row) => row.TenYearCHD === 1),
      sampleSize: inBin.length,
    }
  })

  return bins
}

export function compareGroups(rows, key) {
  const left = rows.filter((row) => row[key] === 0)
  const right = rows.filter((row) => row[key] === 1)

  const create = (groupRows, label) => ({
    label,
    chdRate: percentage(groupRows, (row) => row.TenYearCHD === 1),
    avgAge: mean(groupRows, 'age') ?? 0,
    avgCholesterol: mean(groupRows, 'totChol') ?? 0,
    avgSysBP: mean(groupRows, 'sysBP') ?? 0,
    avgBMI: mean(groupRows, 'BMI') ?? 0,
    avgGlucose: mean(groupRows, 'glucose') ?? 0,
    sampleSize: groupRows.length,
  })

  return [create(left, 'No'), create(right, 'Yes')]
}
