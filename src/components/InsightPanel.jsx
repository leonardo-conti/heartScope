import { formatNumber } from '../utils/stats'

function InsightPanel({ stats, correlations, insightCards }) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-semibold text-slate-900">Statistical Insights</h2>
        <p className="mt-1 text-xs text-slate-500">
          Summary metrics and associations from the currently filtered population.
        </p>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Filtered sample:</strong> {stats.sampleSize}
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>CHD rate:</strong> {formatNumber(stats.chdRate, 1)}%
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Avg age:</strong> {formatNumber(stats.avgAge, 1)}
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Avg cholesterol:</strong> {formatNumber(stats.avgCholesterol, 1)}
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Avg systolic BP:</strong> {formatNumber(stats.avgSysBP, 1)}
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Avg BMI:</strong> {formatNumber(stats.avgBMI, 1)}
        </p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <strong>Avg glucose:</strong> {formatNumber(stats.avgGlucose, 1)}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          Correlation with TenYearCHD
        </h3>
        <div className="grid gap-2 md:grid-cols-3">
          {correlations.map((entry) => (
            <p key={entry.label} className="rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-xs text-indigo-700">
              <strong>{entry.label}:</strong> {formatNumber(entry.value, 3)}
            </p>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Auto Insight Cards</h3>
        <div className="space-y-2">
          {insightCards.map((card) => (
            <p key={card} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
              {card}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default InsightPanel
