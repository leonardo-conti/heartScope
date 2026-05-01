import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import bundledCsv from './data/framingham_heart_study.csv?raw'
import ChartCard from './components/ChartCard'
import DataTable from './components/DataTable'
import FilterPanel from './components/FilterPanel'
import InsightPanel from './components/InsightPanel'
import MetricCard from './components/MetricCard'
import {
  bpScatter,
  chdHeatmapByBmiGlucose,
  cholesterolBoxPlotByOutcome,
  chdRateByAgeGroup,
  chdRateBySmoking,
  compareGroups,
  riskFactorBins,
} from './utils/chartTransforms'
import { getAvailableRanges, parseCsvText } from './utils/dataCleaning'
import { formatNumber, mean, pearsonCorrelation, percentage } from './utils/stats'

const RISK_FACTORS = [
  { label: 'Age', key: 'age' },
  { label: 'Total Cholesterol', key: 'totChol' },
  { label: 'Systolic BP', key: 'sysBP' },
  { label: 'BMI', key: 'BMI' },
  { label: 'Glucose', key: 'glucose' },
  { label: 'Cigarettes / Day', key: 'cigsPerDay' },
]

const TRACKED_FIELDS = [
  'education',
  'cigsPerDay',
  'BPMeds',
  'totChol',
  'BMI',
  'heartRate',
  'glucose',
]

const SEX_LABELS = {
  male: 'Male',
  female: 'Female',
}

const BINARY_FILTER_LABELS = {
  yes: 'Yes',
  no: 'No',
}

function getDefaultFilters(ranges) {
  return {
    minAge: ranges.minAge,
    maxAge: ranges.maxAge,
    sex: 'all',
    smoker: 'all',
    diabetes: 'all',
    hypertension: 'all',
    chdOutcome: 'all',
  }
}

function applyFilters(rows, filters) {
  return rows.filter((row) => {
    if (row.age !== null && (row.age < filters.minAge || row.age > filters.maxAge)) {
      return false
    }
    if (filters.sex === 'male' && row.male !== 1) return false
    if (filters.sex === 'female' && row.male !== 0) return false
    if (filters.smoker === 'yes' && row.currentSmoker !== 1) return false
    if (filters.smoker === 'no' && row.currentSmoker !== 0) return false
    if (filters.diabetes === 'yes' && row.diabetes !== 1) return false
    if (filters.diabetes === 'no' && row.diabetes !== 0) return false
    if (filters.hypertension === 'yes' && row.prevalentHyp !== 1) return false
    if (filters.hypertension === 'no' && row.prevalentHyp !== 0) return false
    if (filters.chdOutcome === 'yes' && row.TenYearCHD !== 1) return false
    if (filters.chdOutcome === 'no' && row.TenYearCHD !== 0) return false
    return true
  })
}

function makeInsightCards(rows) {
  const smokerGroups = compareGroups(rows, 'currentSmoker')
  const diabetesGroups = compareGroups(rows, 'diabetes')
  const hypGroups = compareGroups(rows, 'prevalentHyp')

  return [
    `Smokers CHD rate: ${formatNumber(smokerGroups[1].chdRate)}% vs non-smokers ${formatNumber(smokerGroups[0].chdRate)}%.`,
    `Diabetes CHD rate: ${formatNumber(diabetesGroups[1].chdRate)}% vs non-diabetic ${formatNumber(diabetesGroups[0].chdRate)}%.`,
    `Hypertension CHD rate: ${formatNumber(hypGroups[1].chdRate)}% vs no hypertension ${formatNumber(hypGroups[0].chdRate)}%.`,
  ]
}

function App() {
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('No file loaded')
  const [selectedRiskFactor, setSelectedRiskFactor] = useState('age')
  const [selectedComparison, setSelectedComparison] = useState('smoking')
  const [filters, setFilters] = useState(getDefaultFilters({ minAge: 30, maxAge: 80 }))

  const ranges = useMemo(() => getAvailableRanges(rows), [rows])
  const defaultFilters = useMemo(() => getDefaultFilters(ranges), [ranges])

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])

  const overview = useMemo(
    () => ({
      rowCount: rows.length,
      columnCount: rows.length > 0 ? Object.keys(rows[0]).length - 1 : 16,
      chdPercent: percentage(rows, (row) => row.TenYearCHD === 1),
      avgAge: mean(rows, 'age'),
      avgCholesterol: mean(rows, 'totChol'),
      avgSysBP: mean(rows, 'sysBP'),
    }),
    [rows],
  )

  const insightStats = useMemo(
    () => ({
      sampleSize: filteredRows.length,
      chdRate: percentage(filteredRows, (row) => row.TenYearCHD === 1),
      avgAge: mean(filteredRows, 'age'),
      avgCholesterol: mean(filteredRows, 'totChol'),
      avgSysBP: mean(filteredRows, 'sysBP'),
      avgBMI: mean(filteredRows, 'BMI'),
      avgGlucose: mean(filteredRows, 'glucose'),
    }),
    [filteredRows],
  )

  const correlations = useMemo(
    () => [
      { label: 'Age', value: pearsonCorrelation(filteredRows, 'age', 'TenYearCHD') },
      { label: 'Cholesterol', value: pearsonCorrelation(filteredRows, 'totChol', 'TenYearCHD') },
      { label: 'Systolic BP', value: pearsonCorrelation(filteredRows, 'sysBP', 'TenYearCHD') },
      { label: 'BMI', value: pearsonCorrelation(filteredRows, 'BMI', 'TenYearCHD') },
      { label: 'Glucose', value: pearsonCorrelation(filteredRows, 'glucose', 'TenYearCHD') },
      { label: 'Cigs/Day', value: pearsonCorrelation(filteredRows, 'cigsPerDay', 'TenYearCHD') },
    ],
    [filteredRows],
  )

  const compareSmoker = useMemo(
    () => compareGroups(filteredRows, 'currentSmoker'),
    [filteredRows],
  )
  const compareDiabetes = useMemo(
    () => compareGroups(filteredRows, 'diabetes'),
    [filteredRows],
  )
  const compareHypertension = useMemo(
    () => compareGroups(filteredRows, 'prevalentHyp'),
    [filteredRows],
  )
  const bmiGlucoseHeatmap = useMemo(
    () => chdHeatmapByBmiGlucose(filteredRows),
    [filteredRows],
  )
  const activeFilterChips = useMemo(() => {
    const chips = []
    if (filters.minAge !== defaultFilters.minAge || filters.maxAge !== defaultFilters.maxAge) {
      chips.push({
        key: 'age',
        label: `Age ${filters.minAge}-${filters.maxAge}`,
      })
    }
    if (filters.sex !== 'all') {
      chips.push({ key: 'sex', label: `Sex: ${SEX_LABELS[filters.sex]}` })
    }
    if (filters.smoker !== 'all') {
      chips.push({ key: 'smoker', label: `Smoking: ${BINARY_FILTER_LABELS[filters.smoker]}` })
    }
    if (filters.diabetes !== 'all') {
      chips.push({
        key: 'diabetes',
        label: `Diabetes: ${BINARY_FILTER_LABELS[filters.diabetes]}`,
      })
    }
    if (filters.hypertension !== 'all') {
      chips.push({
        key: 'hypertension',
        label: `Hypertension: ${BINARY_FILTER_LABELS[filters.hypertension]}`,
      })
    }
    if (filters.chdOutcome !== 'all') {
      chips.push({
        key: 'chdOutcome',
        label: `CHD Outcome: ${filters.chdOutcome === 'yes' ? 'Positive (1)' : 'Negative (0)'}`,
      })
    }
    return chips
  }, [filters, defaultFilters])

  const dataQuality = useMemo(() => {
    const missing = TRACKED_FIELDS.map((field) => {
      const missingCount = rows.filter((row) => row[field] === null || row[field] === undefined).length
      return {
        field,
        missingCount,
        missingPct: rows.length > 0 ? (missingCount / rows.length) * 100 : 0,
      }
    }).filter((entry) => entry.missingCount > 0)

    const chartUsage = [
      {
        chart: 'CHD by age group',
        used: filteredRows.filter((row) => Number.isFinite(row.age)).length,
      },
      {
        chart: 'CHD by smoking',
        used: filteredRows.filter((row) => row.currentSmoker === 0 || row.currentSmoker === 1).length,
      },
      {
        chart: 'Cholesterol box plot',
        used: filteredRows.filter((row) => Number.isFinite(row.totChol)).length,
      },
      {
        chart: 'SysBP vs DiaBP',
        used: filteredRows.filter((row) => Number.isFinite(row.sysBP) && Number.isFinite(row.diaBP)).length,
      },
      {
        chart: 'BMI + glucose heatmap',
        used: bmiGlucoseHeatmap.totalUsed,
      },
      {
        chart: 'Risk factor explorer',
        used: filteredRows.filter((row) => Number.isFinite(row[selectedRiskFactor])).length,
      },
    ]

    return { missing, chartUsage }
  }, [rows, filteredRows, bmiGlucoseHeatmap.totalUsed, selectedRiskFactor])

  const comparisonSections = [
    {
      key: 'smoking',
      title: 'Smokers vs Non-smokers',
      noLabel: 'Non-smoker',
      yesLabel: 'Smoker',
      data: compareSmoker,
    },
    {
      key: 'diabetes',
      title: 'Diabetic vs Non-diabetic',
      noLabel: 'Non-diabetic',
      yesLabel: 'Diabetic',
      data: compareDiabetes,
    },
    {
      key: 'hypertension',
      title: 'Hypertensive vs Non-hypertensive',
      noLabel: 'Non-hypertensive',
      yesLabel: 'Hypertensive',
      data: compareHypertension,
    },
  ]
  const activeComparison =
    comparisonSections.find((section) => section.key === selectedComparison) ??
    comparisonSections[0]
  const comparisonDelta = {
    chdRate: activeComparison.data[1].chdRate - activeComparison.data[0].chdRate,
    avgSysBP: activeComparison.data[1].avgSysBP - activeComparison.data[0].avgSysBP,
    avgGlucose: activeComparison.data[1].avgGlucose - activeComparison.data[0].avgGlucose,
  }

  const handleLoadBundled = () => {
    const parsedRows = parseCsvText(bundledCsv)
    setRows(parsedRows)
    const nextRanges = getAvailableRanges(parsedRows)
    setFilters(getDefaultFilters(nextRanges))
    setFileName('Bundled Framingham dataset')
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const parsedRows = parseCsvText(text)
    setRows(parsedRows)
    const nextRanges = getAvailableRanges(parsedRows)
    setFilters(getDefaultFilters(nextRanges))
    setFileName(file.name)
  }

  const handleResetAllFilters = () => {
    if (activeFilterChips.length >= 3) {
      const shouldReset = window.confirm(
        `You have ${activeFilterChips.length} active filters. Clear them all?`,
      )
      if (!shouldReset) return
    }
    setFilters(defaultFilters)
  }

  const handleRemoveFilterChip = (chipKey) => {
    if (chipKey === 'age') {
      setFilters((prev) => ({
        ...prev,
        minAge: defaultFilters.minAge,
        maxAge: defaultFilters.maxAge,
      }))
      return
    }

    setFilters((prev) => ({
      ...prev,
      [chipKey]: 'all',
    }))
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 md:p-6">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-3 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          Healthcare Analytics Dashboard
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          HeartScope: Interactive Heart Risk Explorer
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Explore Framingham risk factors and outcome relationships in a clean analytics dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLoadBundled}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Load Bundled CSV
          </button>
          <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
          <span className="self-center text-xs text-slate-500">Source: {fileName}</span>
        </div>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Rows" value={overview.rowCount} />
        <MetricCard label="Columns" value={overview.columnCount} />
        <MetricCard label="CHD %" value={`${formatNumber(overview.chdPercent)}%`} />
        <MetricCard label="Avg Age" value={formatNumber(overview.avgAge)} />
        <MetricCard label="Avg Cholesterol" value={formatNumber(overview.avgCholesterol)} />
        <MetricCard label="Avg Systolic BP" value={formatNumber(overview.avgSysBP)} />
      </section>

      <div className="mb-6">
        <FilterPanel filters={filters} setFilters={setFilters} ranges={ranges} />
      </div>
      <section className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Active Filters</h3>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            onClick={handleResetAllFilters}
          >
            Reset All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.length === 0 ? (
            <p className="text-xs text-slate-500">No active filters. Showing full dataset range.</p>
          ) : (
            activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleRemoveFilterChip(chip.key)}
                title="Click to remove this filter"
                aria-label={`Remove ${chip.label} filter`}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                {chip.label} {'\u00D7'}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="CHD Rate by Age Group"
          description="Outcome percentage across age bins in the filtered sample."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chdRateByAgeGroup(filteredRows)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="chdRate" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="CHD Rate by Smoking Status"
          description="Compares smoker and non-smoker outcome rates."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chdRateBySmoking(filteredRows)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="chdRate" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Cholesterol Distribution by CHD Outcome"
          description="Box plot style summary (min, Q1, median, Q3, max) by outcome."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cholesterolBoxPlotByOutcome(filteredRows)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="outcome" type="category" />
              <YAxis
                type="number"
                name="Total Cholesterol"
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />

              <Bar dataKey="rangeBase" stackId="range" fill="transparent" />
              <Bar dataKey="rangeHeight" stackId="range" fill="#94a3b8" barSize={8} name="Min-Max Range" />

              <Bar dataKey="iqrBase" stackId="iqr" fill="transparent" />
              <Bar dataKey="iqrHeight" stackId="iqr" fill="#f97316" barSize={28} name="IQR (Q1-Q3)" />

              <Scatter dataKey="median" fill="#111827" name="Median" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Systolic BP vs Diastolic BP"
          description="Blood pressure relationships grouped by outcome."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sysBP" name="Systolic BP" type="number" domain={['auto', 'auto']} />
              <YAxis dataKey="diaBP" name="Diastolic BP" type="number" domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Scatter name="No CHD" data={bpScatter(filteredRows).filter((d) => d.outcome === 'No CHD')} fill="#22c55e" />
              <Scatter name="CHD" data={bpScatter(filteredRows).filter((d) => d.outcome === 'CHD')} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="CHD Risk by BMI + Glucose"
          description="Heatmap of CHD rate (%) across BMI and glucose bins."
        >
          <div className="h-full overflow-auto">
            <div className="mb-2 text-xs text-slate-500">Rows: glucose bins | Columns: BMI bins</div>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `80px repeat(${bmiGlucoseHeatmap.bmiLabels.length || 1}, minmax(56px, 1fr))`,
              }}
            >
              <div />
              {bmiGlucoseHeatmap.bmiLabels.map((label) => (
                <div key={label} className="text-center text-[10px] text-slate-600">
                  {label}
                </div>
              ))}

              {bmiGlucoseHeatmap.cells.map((rowCells, rowIdx) => (
                <div key={bmiGlucoseHeatmap.glucoseLabels[rowIdx]} className="contents">
                  <div className="pr-1 text-right text-[10px] text-slate-600">
                    {bmiGlucoseHeatmap.glucoseLabels[rowIdx]}
                  </div>
                  {rowCells.map((cell) => {
                    const intensity = Math.min(1, cell.chdRate / 35)
                    const bgColor = `rgba(239, 68, 68, ${0.12 + intensity * 0.78})`
                    return (
                      <div
                        key={`${cell.glucoseIdx}-${cell.bmiIdx}`}
                        className="flex h-10 items-center justify-center rounded text-[10px] font-semibold text-slate-900"
                        style={{ backgroundColor: bgColor }}
                        title={`BMI ${cell.bmiLabel}, Glucose ${cell.glucoseLabel}, CHD ${formatNumber(cell.chdRate)}%, n=${cell.sampleSize}`}
                      >
                        {cell.sampleSize > 0 ? `${formatNumber(cell.chdRate)}%` : 'NA'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-slate-500">
              Darker red means higher CHD rate in that BMI+glucose segment.
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
              <span className="font-medium">CHD Rate Scale</span>
              <div className="h-2 w-28 rounded bg-gradient-to-r from-red-100 via-red-300 to-red-600" />
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Risk Factor Explorer (Stretch)"
          description="How CHD rate changes across bins for selected variable."
        >
          <div className="mb-3">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedRiskFactor}
              onChange={(event) => setSelectedRiskFactor(event.target.value)}
            >
              {RISK_FACTORS.map((factor) => (
                <option key={factor.key} value={factor.key}>
                  {factor.label}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={riskFactorBins(filteredRows, selectedRiskFactor)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="chdRate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <InsightPanel
          stats={insightStats}
          correlations={correlations}
          insightCards={makeInsightCards(filteredRows)}
        />

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Compare Groups (Stretch)</h3>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={selectedComparison}
            onChange={(event) => setSelectedComparison(event.target.value)}
          >
            {comparisonSections.map((section) => (
              <option key={section.key} value={section.key}>
                {section.title}
              </option>
            ))}
          </select>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">{activeComparison.title}</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-semibold">{activeComparison.noLabel}</p>
                <p>Sample size: {activeComparison.data[0].sampleSize}</p>
                <p>CHD rate: {formatNumber(activeComparison.data[0].chdRate)}%</p>
                <p>Avg age: {formatNumber(activeComparison.data[0].avgAge)}</p>
                <p>Avg cholesterol: {formatNumber(activeComparison.data[0].avgCholesterol)}</p>
                <p>Avg systolic BP: {formatNumber(activeComparison.data[0].avgSysBP)}</p>
                <p>Avg BMI: {formatNumber(activeComparison.data[0].avgBMI)}</p>
                <p>Avg glucose: {formatNumber(activeComparison.data[0].avgGlucose)}</p>
              </div>

              <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-800">
                <p className="font-semibold">{activeComparison.yesLabel}</p>
                <p>Sample size: {activeComparison.data[1].sampleSize}</p>
                <p>CHD rate: {formatNumber(activeComparison.data[1].chdRate)}%</p>
                <p>Avg age: {formatNumber(activeComparison.data[1].avgAge)}</p>
                <p>Avg cholesterol: {formatNumber(activeComparison.data[1].avgCholesterol)}</p>
                <p>Avg systolic BP: {formatNumber(activeComparison.data[1].avgSysBP)}</p>
                <p>Avg BMI: {formatNumber(activeComparison.data[1].avgBMI)}</p>
                <p>Avg glucose: {formatNumber(activeComparison.data[1].avgGlucose)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <p className="font-semibold">Key Differences</p>
            <p>
              CHD rate difference ({activeComparison.yesLabel} - {activeComparison.noLabel}):{' '}
              {comparisonDelta.chdRate >= 0 ? '+' : ''}
              {formatNumber(comparisonDelta.chdRate)} percentage points
            </p>
            <p>
              Avg systolic BP difference: {comparisonDelta.avgSysBP >= 0 ? '+' : ''}
              {formatNumber(comparisonDelta.avgSysBP)}
            </p>
            <p>
              Avg glucose difference: {comparisonDelta.avgGlucose >= 0 ? '+' : ''}
              {formatNumber(comparisonDelta.avgGlucose)}
            </p>
          </div>
        </section>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Data Quality</h3>
        <p className="mt-1 text-xs text-slate-500">
          Missingness is calculated on loaded data. Chart usage shows rows included after filter and
          field-level exclusions.
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">Missing Values by Field</p>
            <div className="space-y-1 text-xs text-slate-700">
              {dataQuality.missing.map((entry) => (
                <p key={entry.field} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{entry.field}</span>
                  <span>
                    {entry.missingCount} ({formatNumber(entry.missingPct)}%)
                  </span>
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">Rows Used by Chart</p>
            <div className="space-y-1 text-xs text-slate-700">
              {dataQuality.chartUsage.map((entry) => (
                <p key={entry.chart} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{entry.chart}</span>
                  <span>{entry.used}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <DataTable rows={filteredRows} />
      </section>

      <footer className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This dashboard is for exploratory data analysis only and is not medical advice. It
        shows relationships in historical Framingham data and is not a clinical diagnosis tool.
      </footer>
    </main>
  )
}

export default App
