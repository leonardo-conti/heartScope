function DataTable({ rows }) {
  const preview = rows.slice(0, 8)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        Filtered Data Preview ({preview.length} rows shown)
      </h3>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="p-2 font-semibold">Age</th>
              <th className="p-2 font-semibold">Sex</th>
              <th className="p-2 font-semibold">Smoker</th>
              <th className="p-2 font-semibold">Diabetes</th>
              <th className="p-2 font-semibold">Tot Chol</th>
              <th className="p-2 font-semibold">Sys BP</th>
              <th className="p-2 font-semibold">BMI</th>
              <th className="p-2 font-semibold">Glucose</th>
              <th className="p-2 font-semibold">TenYearCHD</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 text-slate-700 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
              >
                <td className="p-2">{row.age ?? 'NA'}</td>
                <td className="p-2">{row.male === 1 ? 'Male' : 'Female'}</td>
                <td className="p-2">{row.currentSmoker === 1 ? 'Yes' : 'No'}</td>
                <td className="p-2">{row.diabetes === 1 ? 'Yes' : 'No'}</td>
                <td className="p-2">{row.totChol ?? 'NA'}</td>
                <td className="p-2">{row.sysBP ?? 'NA'}</td>
                <td className="p-2">{row.BMI ?? 'NA'}</td>
                <td className="p-2">{row.glucose ?? 'NA'}</td>
                <td className="p-2">{row.TenYearCHD}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DataTable
