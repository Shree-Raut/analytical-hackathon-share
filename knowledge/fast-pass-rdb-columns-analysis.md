# Analysis summary for `Select_result2026_03_31_06_01_13.xlsx`

## High-level findings
- The workbook contains **73,719** rows with columns: `database`, `name`, `description`.
- All rows belong to the `reports` database value.
- After normalization and deduplication, there are **5,202** unique field names.
- The file is much stronger as a **report-field semantic catalog** than as a pure KPI catalog.

## Recommended Fast Pass adoption path
### Phase 1
Use only:
- `fast-pass-rdb-columns.core-metrics.json`
- `fast-pass-rdb-columns.core-dimensions.json`

### Phase 2
Add:
- `fast-pass-rdb-columns.core.json`

### Phase 3
Use `fast-pass-rdb-columns.review-top800.json` only for manual review flows and analytics.

## Examples of strong metric candidates
- Market Rent (currency, used 411 times)
- Deposit Held (currency, used 352 times)
- Lease Term (integer, used 339 times)
- Budgeted Rent (currency, used 323 times)
- Scheduled Charges (currency, used 279 times)
- Lease Approved (integer, used 267 times)
- New Leads (integer, used 258 times)
- Scheduled Rent (currency, used 251 times)
- Application Completed (integer, used 229 times)
- Application Approved (integer, used 219 times)
- Lease Completed (integer, used 217 times)
- Lease Term Months (integer, used 210 times)
- Rentable Units (integer, used 179 times)
- Prior Lease Rent (currency, used 145 times)
- Space Option (percent, used 131 times)
- Bedroom Count (integer, used 118 times)
- Actual Charges (currency, used 109 times)
- Applications Completed (integer, used 102 times)
- First Visit/Tour (integer, used 102 times)
- Lease Completed (Cancelled) (integer, used 102 times)
- # in Household (integer, used 96 times)
- Days Vacant (integer, used 91 times)
- Deposit Charged (currency, used 91 times)
- Unit/Space (integer, used 91 times)
- Unit Count (integer, used 89 times)
- Avg. Market Rent (currency, used 88 times)
- Scheduled Appointments (integer, used 81 times)
- Job Cost Code (currency, used 80 times)
- Lease Term Name (integer, used 80 times)
- Utility Allowance (currency, used 79 times)

## Examples of strong dimension candidates
- Property (string, used 2392 times)
- Property Look-up Code (string, used 1747 times)
- Bldg-Unit (string, used 1398 times)
- Unit Type (enum, used 936 times)
- Resident (string, used 923 times)
- Floor Plan (string, used 661 times)
- Lease Status (enum, used 558 times)
- Move-In (date, used 518 times)
- Status (enum, used 504 times)
- Charge Code (string, used 427 times)
- Lease End (date, used 427 times)
- Lease ID (string, used 409 times)
- Description (string, used 406 times)
- Lease Start (date, used 375 times)
- Email (email, used 365 times)
- Total (date, used 351 times)
- Leasing Agent (string, used 337 times)
- Account Name (string, used 333 times)
- Lease Occupancy Type (enum, used 316 times)
- Post Month (date, used 306 times)
- Move-Out (date, used 267 times)
- Resident ID (string, used 247 times)
- Account (string, used 220 times)
- Ledger (string, used 216 times)
- Unit Status (enum, used 215 times)
- Post Date (date, used 214 times)
- Bldg (string, used 192 times)
- Created On (date, used 192 times)
- Student ID (string, used 176 times)
- Move-Out Date (date, used 172 times)
