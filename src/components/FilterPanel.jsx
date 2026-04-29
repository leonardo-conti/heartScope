const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700'

function FilterPanel({ filters, setFilters, ranges }) {
  const setValue = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Filters</h2>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm text-slate-600">
          Min Age
          <input
            type="number"
            className={selectClass}
            min={ranges.minAge}
            max={filters.maxAge}
            value={filters.minAge}
            onChange={(event) => setValue('minAge', Number(event.target.value))}
          />
        </label>

        <label className="text-sm text-slate-600">
          Max Age
          <input
            type="number"
            className={selectClass}
            min={filters.minAge}
            max={ranges.maxAge}
            value={filters.maxAge}
            onChange={(event) => setValue('maxAge', Number(event.target.value))}
          />
        </label>

        <label className="text-sm text-slate-600">
          Sex
          <select
            className={selectClass}
            value={filters.sex}
            onChange={(event) => setValue('sex', event.target.value)}
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Smoker
          <select
            className={selectClass}
            value={filters.smoker}
            onChange={(event) => setValue('smoker', event.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Diabetes
          <select
            className={selectClass}
            value={filters.diabetes}
            onChange={(event) => setValue('diabetes', event.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Hypertension
          <select
            className={selectClass}
            value={filters.hypertension}
            onChange={(event) => setValue('hypertension', event.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="text-sm text-slate-600">
          CHD Outcome
          <select
            className={selectClass}
            value={filters.chdOutcome}
            onChange={(event) => setValue('chdOutcome', event.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">CHD (1)</option>
            <option value="no">No CHD (0)</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default FilterPanel
