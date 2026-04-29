function validNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(value)
}

export function mean(rows, key) {
  const values = rows.map((row) => row[key]).filter(validNumber)
  if (values.length === 0) return null
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

export function percentage(rows, predicate) {
  if (rows.length === 0) return 0
  const matches = rows.filter(predicate).length
  return (matches / rows.length) * 100
}

export function pearsonCorrelation(rows, xKey, yKey) {
  const points = rows
    .map((row) => ({ x: row[xKey], y: row[yKey] }))
    .filter((point) => validNumber(point.x) && validNumber(point.y))

  if (points.length < 2) return null

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
  const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  )

  if (denominator === 0) return null
  return numerator / denominator
}

export function formatNumber(value, digits = 1) {
  if (!validNumber(value)) return 'N/A'
  return value.toFixed(digits)
}
