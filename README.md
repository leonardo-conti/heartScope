# HeartScope: Interactive Heart Risk Explorer

## 1) Overview
HeartScope is an interactive data visualization and statistical analysis app built on the Framingham Heart Study dataset. It helps users explore how risk factors (age, smoking, diabetes, blood pressure, cholesterol, BMI, glucose) relate to 10-year coronary heart disease (CHD) outcomes.

This project is optimized for interviews:
- clear architecture
- explainable logic
- polished dashboard UI
- thoughtful handling of missing data

## 2) How to Run
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

### Dataset
- The app includes a local CSV at `src/data/framingham_heart_study.csv`.
- You can also upload a CSV using the “Upload CSV” button.
- For full analysis, replace the sample CSV with your full Framingham file while preserving headers.

## 3) Tech Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **CSV Parsing:** PapaParse
- **Data Source:** local CSV file (no backend)

## 4) Architecture
### Components
- `src/App.jsx`: main dashboard container, state, orchestration
- `src/components/MetricCard.jsx`: top KPI cards
- `src/components/FilterPanel.jsx`: interactive filtering UI
- `src/components/ChartCard.jsx`: reusable chart container
- `src/components/InsightPanel.jsx`: stats, correlations, generated insight cards
- `src/components/DataTable.jsx`: quick filtered-row preview

### Utilities
- `src/utils/dataCleaning.js`: parse + numeric conversion + range extraction
- `src/utils/stats.js`: mean, percentage, Pearson correlation, formatting helpers
- `src/utils/chartTransforms.js`: chart-ready transforms and stretch analytics helpers

## 5) AI Tools Used
- **Claude:** planning, component scaffolding, debugging chart/data logic
- **Cursor:** code generation, inline refactoring, fixing bugs
- **ChatGPT:** project strategy, feature selection, interview positioning

## 6) Key Design Decisions
- **No backend:** minimized complexity and deployment friction for interview context.
- **Single source of truth for data:** all charts/stats derive from the same filtered dataset.
- **Small reusable components:** easier to explain and maintain.
- **Explicit helper functions:** chart transforms and stats are separated from UI for readability.
- **Polished but conservative UX:** card layout, spacing, labels, and consistent color coding for CHD vs No CHD.

## 7) Data Cleaning Decisions
- Numeric columns are parsed safely (`null` for missing/invalid values).
- Common placeholders (`NA`, `NaN`, `NULL`) are treated as missing values.
- UTF-8 BOM on CSV headers is normalized (so `male` maps correctly).
- Missing values are excluded only from calculations/charts that require them.
- Rows are not dropped globally; this preserves sample size for filters and other analyses.
- Correlations are computed only on rows with valid values for both compared variables.

## 8) Challenges and How I Solved Them
- **Missing values across many columns:** solved with field-level null handling and per-chart filtering.
- **Keeping code interview-explainable:** solved by separating parsing/stats/transforms from rendering.
- **Balancing polish with simplicity:** solved using reusable cards and straightforward chart configs.
- **Stretch scope control:** delivered Risk Factor Explorer, group comparison, and insight cards without over-engineering.

## 9) What I’d Improve With More Time
- Add unit tests for `stats.js` and `chartTransforms.js`.
- Add URL-synced filter state for shareable dashboard views.
- Add chart download/export and report snapshots.
- Add stronger table features (sorting, pagination, column toggles).
- Add optional lightweight educational risk score panel with transparent formula details.

## 10) Interview Walkthrough Script
1. **Context (30 sec):** “I built HeartScope to explore relationships in the Framingham dataset using an explainable frontend-only architecture.”
2. **Architecture (1 min):** “`App.jsx` handles state and orchestration; utilities own transformations/stats; components are presentation-focused.”
3. **Data flow (1 min):**
   - load/upload CSV
   - parse and clean to typed rows
   - apply interactive filters
   - derive chart/stat outputs from filtered rows
4. **Core features demo (2 min):**
   - metrics overview
   - filter panel
   - required charts
   - insight panel with correlations
5. **Stretch demo (1 min):**
   - risk factor explorer
   - compare groups
   - auto insight cards
6. **Judgment discussion (1 min):**
   - missing data strategy
   - tradeoffs from keeping no backend
   - clear disclaimer: EDA, not medical advice
