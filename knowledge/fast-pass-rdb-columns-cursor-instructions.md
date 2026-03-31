# Fast Pass RDB Columns Semantic Catalog

This bundle was generated from the uploaded workbook `Select_result2026_03_31_06_01_13.xlsx`.

## What the source file contains
- Raw rows analyzed: **73,719**
- Unique normalized field names: **5,202**
- Source database values seen: **reports**

## What was generated
- Core definitions: **624**
- Core metrics: **249**
- Core dimensions: **375**
- Secondary definitions: **1,112**
- Review-needed definitions included: **800** (top ambiguous/high-frequency subset)

## Important note
This workbook mostly contains **report column names + help-text descriptions**.
These are best used as a **semantic field catalog** for Fast Pass matching.
They are **not formula-backed KPI definitions**.

## Recommended integration strategy
1. Keep the existing canonical KPI metric catalog.
2. Add `fast-pass-rdb-columns.core-metrics.json` as a **secondary metric matcher**.
3. Add `fast-pass-rdb-columns.core-dimensions.json` as a **dimension matcher**.
4. Use `fast-pass-rdb-columns.core.json` only for broad fallback search.
5. Do **not** auto-map any item from the review file without human confirmation.

## Matching rules Cursor should implement
- Prefer exact alias match.
- Then prefer normalized alias match.
- Then prefer fuzzy match.
- Prefer `cursorPriority = "core"` over `secondary`.
- Prefer higher `usageCount` when scores tie.
- Penalize `ambiguity = "high"`.
- Never auto-confirm `cursorPriority = "review"`.

## Fields available on each definition
- `key`
- `displayName`
- `aliases`
- `description`
- `fieldKind`
- `dataType`
- `primaryTopic`
- `cursorPriority`
- `confidence`
- `ambiguity`
- `usageCount`
- `distinctDescriptions`
- `sourceDatabases`
- `notes`

## Best first files to use
1. `fast-pass-rdb-columns.core-metrics.json`
2. `fast-pass-rdb-columns.core-dimensions.json`

## Example high-value metric names
Market Rent, Deposit Held, Lease Term, Budgeted Rent, Scheduled Charges, Lease Approved, New Leads, Scheduled Rent, Application Completed, Application Approved, Lease Completed, Lease Term Months, Rentable Units, Prior Lease Rent, Space Option, Bedroom Count, Actual Charges, Applications Completed, First Visit/Tour, Lease Completed (Cancelled), # in Household, Days Vacant, Deposit Charged, Unit/Space, Unit Count

## Example high-value dimension names
Property, Property Look-up Code, Bldg-Unit, Unit Type, Resident, Floor Plan, Lease Status, Move-In, Status, Charge Code, Lease End, Lease ID, Description, Lease Start, Email, Total, Leasing Agent, Account Name, Lease Occupancy Type, Post Month, Move-Out, Resident ID, Account, Ledger, Unit Status

## Suggested Cursor prompt
Read these files and integrate them into Fast Pass as an additional semantic matching source:

1. fast-pass-rdb-columns.core-metrics.json
2. fast-pass-rdb-columns.core-dimensions.json
3. fast-pass-rdb-columns.full.json (fallback only)

Requirements:
- Do not replace the existing canonical KPI metric catalog.
- Use the new RDB column catalog as a secondary matcher for uploaded legacy reports.
- Match metrics and dimensions separately.
- Return key, displayName, description, aliases, fieldKind, dataType, confidence, ambiguity, usageCount, and cursorPriority.
- Prefer core definitions over secondary definitions.
- Never auto-confirm review-priority items.
- Expose matching rationale in the Fast Pass review UI.
