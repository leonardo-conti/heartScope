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

function quantile(sortedValues, q) {
  if (sortedValues.length === 0) return null
  const pos = (sortedValues.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sortedValues[base + 1] === undefined) return sortedValues[base]
  return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
}

export function cholesterolBoxPlotByOutcome(rows) {
  const groups = [
    { label: 'No CHD', value: 0 },
    { label: 'CHD', value: 1 },
  ]

  return groups.map((group) => {
    const values = rows
      .filter((row) => row.TenYearCHD === group.value && Number.isFinite(row.totChol))
      .map((row) => row.totChol)
      .sort((a, b) => a - b)

    if (values.length === 0) {
      return {
        outcome: group.label,
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        rangeBase: 0,
        rangeHeight: 0,
        iqrBase: 0,
        iqrHeight: 0,
      }
    }

    const min = values[0]
    const q1 = quantile(values, 0.25)
    const median = quantile(values, 0.5)
    const q3 = quantile(values, 0.75)
    const max = values[values.length - 1]

    return {
      outcome: group.label,
      min,
      q1,
      median,
      q3,
      max,
      rangeBase: min,
      rangeHeight: max - min,
      iqrBase: q1,
      iqrHeight: q3 - q1,
    }
  })
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

export function chdHeatmapByBmiGlucose(rows) {
  const valid = rows.filter(
    (row) =>
      Number.isFinite(row.BMI) &&
      Number.isFinite(row.glucose) &&
      Number.isFinite(row.TenYearCHD),
  )

  if (valid.length === 0) {
    return { bmiLabels: [], glucoseLabels: [], cells: [], totalUsed: 0 }
  }

  const bmiBinCount = 6
  const glucoseBinCount = 6
  const bmiValues = valid.map((row) => row.BMI)
  const glucoseValues = valid.map((row) => row.glucose)
  const bmiMin = Math.min(...bmiValues)
  const bmiMax = Math.max(...bmiValues)
  const glucoseMin = Math.min(...glucoseValues)
  const glucoseMax = Math.max(...glucoseValues)
  const bmiStep = (bmiMax - bmiMin) / bmiBinCount || 1
  const glucoseStep = (glucoseMax - glucoseMin) / glucoseBinCount || 1

  const grid = Array.from({ length: glucoseBinCount }, () =>
    Array.from({ length: bmiBinCount }, () => ({ total: 0, chd: 0 })),
  )

  valid.forEach((row) => {
    const rawBmiIdx = Math.floor((row.BMI - bmiMin) / bmiStep)
    const rawGlucoseIdx = Math.floor((row.glucose - glucoseMin) / glucoseStep)
    const bmiIdx = Math.max(0, Math.min(bmiBinCount - 1, rawBmiIdx))
    const glucoseIdx = Math.max(0, Math.min(glucoseBinCount - 1, rawGlucoseIdx))

    grid[glucoseIdx][bmiIdx].total += 1
    if (row.TenYearCHD === 1) {
      grid[glucoseIdx][bmiIdx].chd += 1
    }
  })

  const bmiLabels = Array.from({ length: bmiBinCount }, (_, idx) => {
    const start = bmiMin + idx * bmiStep
    const end = idx === bmiBinCount - 1 ? bmiMax : start + bmiStep
    return `${start.toFixed(1)}-${end.toFixed(1)}`
  })

  const glucoseLabels = Array.from({ length: glucoseBinCount }, (_, idx) => {
    const start = glucoseMin + idx * glucoseStep
    const end = idx === glucoseBinCount - 1 ? glucoseMax : start + glucoseStep
    return `${start.toFixed(0)}-${end.toFixed(0)}`
  })

  const cells = grid.map((row, glucoseIdx) =>
    row.map((cell, bmiIdx) => ({
      bmiIdx,
      glucoseIdx,
      bmiLabel: bmiLabels[bmiIdx],
      glucoseLabel: glucoseLabels[glucoseIdx],
      sampleSize: cell.total,
      chdRate: cell.total > 0 ? (cell.chd / cell.total) * 100 : 0,
    })),
  )

  return { bmiLabels, glucoseLabels, cells, totalUsed: valid.length }
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
