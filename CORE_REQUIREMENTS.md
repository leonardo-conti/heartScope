# Core Requirements Document: HeartScope

## Project Purpose
Build an interactive, interview-ready web app that helps users explore cardiovascular risk patterns in the Framingham Heart Study dataset through filtering, visualization, and lightweight statistical analysis.

## Users
- Primary: interviewers and technical reviewers evaluating product judgment and engineering quality
- Secondary: analysts/students exploring heart disease risk factor relationships in a historical dataset

## Functional Requirements
1. Load Framingham CSV from local bundled file and user upload.
2. Show dataset overview:
   - row count
   - column count
   - CHD prevalence
   - average age
   - average total cholesterol
   - average systolic BP
3. Provide interactive filters:
   - age range
   - sex
   - smoker status
   - diabetes status
   - hypertension status
   - CHD outcome
4. Render required charts from filtered data:
   - CHD rate by age group
   - CHD rate by smoking status
   - cholesterol distribution by CHD outcome
   - systolic vs diastolic BP scatterplot grouped by CHD outcome
   - BMI vs glucose scatterplot
5. Display statistical insight panel:
   - filtered sample size
   - CHD percentage in filtered subset
   - average age/cholesterol/sysBP/BMI/glucose
   - simple correlation values with TenYearCHD
6. Show clear EDA disclaimer:
   - not medical advice
   - not diagnostic

## Non-Functional Requirements
- Responsive dashboard layout for desktop and laptop
- Clean visual hierarchy and professional healthcare analytics styling
- Fast interactions on local dataset size (~4,240 rows)
- Readable, interview-explainable code with minimal complexity
- No backend dependency for MVP

## Data Requirements
- Input CSV with expected Framingham column names
- Numeric parsing with null-safe handling for missing values
- Preserve rows whenever possible; exclude missing values only where necessary per metric/chart
- Handle the known missing columns: `education`, `cigsPerDay`, `BPMeds`, `totChol`, `BMI`, `heartRate`, `glucose`

## Assumptions
- CSV headers match expected schema exactly
- Dataset is static and small enough for in-browser processing
- Users understand this is exploratory and historical data, not patient-specific prediction
- No protected health information (PHI) handling requirements for this challenge build

## Success Criteria
- All core features are implemented and usable with filtered interactivity
- Visualizations and metrics update correctly on filter changes
- App communicates uncertainty and scope limitations clearly
- Reviewer can follow and explain the implementation quickly
- Project includes documentation that supports technical and interview storytelling
