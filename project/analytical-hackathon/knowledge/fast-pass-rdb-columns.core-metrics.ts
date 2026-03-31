export const FAST_PASS_RDB_COLUMNS_CORE_METRICS = [
  {
    "key": "market_rent",
    "displayName": "Market Rent",
    "aliases": [
      "MARKET RENT",
      "Market Rent"
    ],
    "description": "The Market Rent column displays the market rent amount of the units displayed in the report.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 411,
    "distinctDescriptions": 54,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "deposit_held",
    "displayName": "Deposit Held",
    "aliases": [
      "DEPOSIT HELD",
      "Deposit Held"
    ],
    "description": "The Deposit Held column will display the amount of deposit that the household has paid in, NOT the amount that was required.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 352,
    "distinctDescriptions": 33,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_term",
    "displayName": "Lease Term",
    "aliases": [
      "LEASE TERM",
      "Lease Term"
    ],
    "description": "The Lease Term column displays the lease term assigned to each listed lease. This is an optional column that can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 339,
    "distinctDescriptions": 42,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "budgeted_rent",
    "displayName": "Budgeted Rent",
    "aliases": [
      "BUDGETED RENT",
      "Budgeted Rent",
      "Budgeted_Rent"
    ],
    "description": "Displays the amount at which the unit is budgeted as of the end of the period selected as found under Setup >> Properties >> [Select Property] >> Pricing >> Rent >> Budgeted Rent. Clients who use this column should also have Budgeted Rent selected for the Determine Market Rent setting found under Setup >> Properties >> [Select Property] >> Financial >> Gross Potential Rent.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 323,
    "distinctDescriptions": 42,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges",
    "displayName": "Scheduled Charges",
    "aliases": [
      "Scheduled (Charges)",
      "Scheduled Charges"
    ],
    "description": "The Scheduled Charges column will display all recurring charges that have been created for each listed household (based on what was selected in the 'charge codes' filter). The report should fetch these values based on the move-in/initial lease as to indicate the scheduled charges pertaining to the move-in event.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 279,
    "distinctDescriptions": 37,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_approved",
    "displayName": "Lease Approved",
    "aliases": [
      "LEASE APPROVED",
      "Lease (Approved)",
      "Lease - Approved",
      "Lease Approved"
    ],
    "description": "Counts the number of primary leads that have reached a status of Lease Approved. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 267,
    "distinctDescriptions": 35,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "new_leads",
    "displayName": "New Leads",
    "aliases": [
      "NEW LEADS",
      "New Leads",
      "New Leads=",
      "New_Leads"
    ],
    "description": "A New Lead has completed a guest card in the period selected. Those that have been cancelled or archived are still counted. Guest Cards can be entered manually, through an ILS, phone call, and various other sources. Additional applicants are not added to a profile until the application stage and therefore you will only see one guest card per application in reports. If applicants happen to submit separate or multiple guest cards, the duplicates can be removed from reporting by canceling or archiving the duplicate and labeling it as merged when selecting a reason.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 258,
    "distinctDescriptions": 28,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_rent",
    "displayName": "Scheduled Rent",
    "aliases": [
      "SCHEDULED RENT",
      "Scheduled Rent"
    ],
    "description": "The Scheduled Rent column displays the rent amount that is scheduled for the report.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 251,
    "distinctDescriptions": 37,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_completed",
    "displayName": "Application Completed",
    "aliases": [
      "APPLICATION COMPLETED",
      "Application - Completed",
      "Application Completed"
    ],
    "description": "Displays the initial date of reaching Application Partially Completed or Application Completed status, whichever happened first.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 229,
    "distinctDescriptions": 20,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_approved",
    "displayName": "Application Approved",
    "aliases": [
      "Application - Approved",
      "Application Approved"
    ],
    "description": "Displays the initial date of reaching Application Approved.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 219,
    "distinctDescriptions": 21,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_completed",
    "displayName": "Lease Completed",
    "aliases": [
      "Lease (Completed)",
      "Lease - Completed",
      "Lease Completed"
    ],
    "description": "Displays the initial date of reaching Lease Completed.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 217,
    "distinctDescriptions": 22,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_term_months",
    "displayName": "Lease Term Months",
    "aliases": [
      "LEASE TERM MONTHS",
      "Lease Term (Months)",
      "Lease Term Months"
    ],
    "description": "Displays the number of months in the lease interval based on what is shown in the Resident Profile under Leases >> Lease Dates >> Lease Term column. For integer-based lease terms (i.e. conventional), this value is the Lease Term converted to a simple integer. For date-based lease terms (i.e. student), this value is calculated by dividing the number of days between Renewal Billing Start and All Billing End by the number of days per month in an average year. Month-to-month lease intervals will show 0.00.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 210,
    "distinctDescriptions": 23,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "rentable_units",
    "displayName": "Rentable Units",
    "aliases": [
      "RENTABLE UNITS",
      "Rentable Units"
    ],
    "description": "Displays the count of units that are rented by residents or are available to be rented by leads as of the end of the period selected. You can manage whether exclusion reasons are included in this count under Setup >> Property >> [Select Property] >> Property >> Floor Plans & Units >> Unit Availability / Search >> Exclusion Reasons >> Report As Rentable. The settings can be adjusted per exclusion reason. A unit is either considered excluded or rentable. If a unit is rentable, it may be shown in a unit status column in addition to the rentable units column.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 179,
    "distinctDescriptions": 26,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "prior_lease_rent",
    "displayName": "Prior Lease Rent",
    "aliases": [
      "Prior Lease Rent"
    ],
    "description": "This column will display a monetary value that represents the recurring rent type charges that have been created for each listed household as of the report date for the lease prior to the new lease that was created that is associated to the displayed unit/unit space.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 145,
    "distinctDescriptions": 20,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "space_option",
    "displayName": "Space Option",
    "aliases": [
      "SPACE OPTION",
      "Space Option"
    ],
    "description": "Displays the the space option that is associated to the unit space. For vacant unit spaces, all space options available for the space will display, separated by commas. For occupied unit spaces, the specific space option associated to the resident's lease will display. This column is only available for clients with the Entrata Student product.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 131,
    "distinctDescriptions": 27,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bedroom_count",
    "displayName": "Bedroom Count",
    "aliases": [
      "Bedroom Count"
    ],
    "description": "This column will display the bedroom counts (example: 1, 2, 3, etc) based on all Floor Plans within the selected properties.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "medium",
    "usageCount": 118,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "actual_charges",
    "displayName": "Actual Charges",
    "aliases": [
      "Actual (Charges)",
      "Actual Charges"
    ],
    "description": "Displays the sum of all charges that have been posted in the period selected based on the charge codes selected in the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "medium",
    "usageCount": 109,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_completed",
    "displayName": "Applications Completed",
    "aliases": [
      "APPLICATIONS COMPLETED",
      "Applications Completed"
    ],
    "description": "Counts the number of primary leads that have reached a status of Application Partially Completed or Application Completed. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "medium",
    "usageCount": 102,
    "distinctDescriptions": 17,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "first_visit_tour",
    "displayName": "First Visit/Tour",
    "aliases": [
      "FIRST VISIT/TOUR",
      "First Visit/Tour"
    ],
    "description": "Counts the number of primary leads with an initial onsite visit, property tour, or unit tour listed on the activity log. This column will exclude return visits. Events that are deleted from the activity log will not be included. Events with a missed, cancelled, or reschduled event are not included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "medium",
    "usageCount": 102,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_completed_cancelled",
    "displayName": "Lease Completed (Cancelled)",
    "aliases": [
      "Lease - Completed (Cancelled)",
      "Lease Completed (Cancelled)"
    ],
    "description": "Counts the number of primary leads that reached a status of Lease Completed and are cancelled/archived. For more information click here",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "medium",
    "usageCount": 102,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "number_in_household",
    "displayName": "# in Household",
    "aliases": [
      "# IN HOUSEHOLD",
      "# In Household",
      "# in Household"
    ],
    "description": "Displays the number of persons living in the unit.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 96,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "days_vacant",
    "displayName": "Days Vacant",
    "aliases": [
      "DAYS VACANT",
      "Days Vacant"
    ],
    "description": "The Days Vacant column will display a number that represents the number of days that have elapsed starting form the previous household's move-out date up until the date in which the report was generated. This column won't populate for units in a 'Notice' or 'Occupied' status as these units are currently occupied by residents.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "high",
    "usageCount": 91,
    "distinctDescriptions": 20,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "deposit_charged",
    "displayName": "Deposit Charged",
    "aliases": [
      "Deposit Charged"
    ],
    "description": "Displays the total amount of deposits charged to the resident's active lease interval.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 91,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "unit_space",
    "displayName": "Unit/Space",
    "aliases": [
      "Unit Space",
      "Unit/Space"
    ],
    "description": "The number of units/spaces of each floor plan.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 91,
    "distinctDescriptions": 16,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "unit_count",
    "displayName": "Unit Count",
    "aliases": [
      "UNIT COUNT",
      "Unit Count"
    ],
    "description": "This column displays the unit count # for the selected property. This column can be enabled in Display Options.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 89,
    "distinctDescriptions": 16,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_market_rent",
    "displayName": "Avg. Market Rent",
    "aliases": [
      "AVG. MARKET RENT",
      "Avg Market Rent",
      "Avg. Market Rent"
    ],
    "description": "Displays an amount that represents the avg. market rent for all occupied or on notice units that are displayed in the report as of the end of the user-defined period (essentially only including averages for rentable items that have a market rent value displayed).",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 88,
    "distinctDescriptions": 13,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_appointments",
    "displayName": "Scheduled Appointments",
    "aliases": [
      "Scheduled Appointments"
    ],
    "description": "Counts the number of appointments scheduled in the timeframe selected, or the number of appointments scheduled for leads created in the timeframe selected. The results depend on the selection of the Results Based on filter.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 81,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "job_cost_code",
    "displayName": "Job Cost Code",
    "aliases": [
      "JOB COST CODE",
      "Job Cost Code"
    ],
    "description": "This column will display the job cost code associated with the line item of the invoice.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 80,
    "distinctDescriptions": 14,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_term_name",
    "displayName": "Lease Term Name",
    "aliases": [
      "LEASE TERM NAME",
      "Lease Term Name"
    ],
    "description": "This column displays the name of lease term associated to the person. If a name has not been given to the lease term it will be blank. (This information is used for most student properties.) It is found in the resident profile under Lease, Lease Dates, Lease Term and on the lead profile under the application and unit preference tab.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 80,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "utility_allowance",
    "displayName": "Utility Allowance",
    "aliases": [
      "Utility Allowance"
    ],
    "description": "Displays the utility allowance amount on the household's certification that is effective as of the end of the period selected. This column is only available for clients with the Entrata Affordable product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 79,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_budgeted_rent",
    "displayName": "Avg. Budgeted Rent",
    "aliases": [
      "AVG BUDGETED RENT",
      "Avg Budgeted Rent",
      "Avg. Budgeted Rent"
    ],
    "description": "Displays an amount that represents the avg. budgeted rent for all occupied or on notice units that are displayed in the report as of the end of the user-defined period (essentially only including averages for rentable items that have a budgeted rent value displayed).",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 77,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "pre_payments",
    "displayName": "Pre-payments",
    "aliases": [
      "PRE-PAYMENTS",
      "Pre-Payments",
      "Pre-payments",
      "Pre_Payments"
    ],
    "description": "Displays the total amount of unallocated payments (including negative payments, payments-in-kind, etc.) as of the end of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 76,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "tenant_rent",
    "displayName": "Tenant Rent",
    "aliases": [
      "Tenant Rent"
    ],
    "description": "Displays the tenant rent amount on the household's certification that is effective as of the end of the period selected. This column is only available for clients with the Entrata Affordable product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 76,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "occupied_units",
    "displayName": "Occupied Units",
    "aliases": [
      "Occupied Units"
    ],
    "description": "Displays the count of units that are occupied by residents as of the end of the period selected. Occupied units are units in a status of Occupied No Notice, Notice Rented, and Notice Unrented.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 75,
    "distinctDescriptions": 17,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_approved",
    "displayName": "Applications Approved",
    "aliases": [
      "APPLICATIONS APPROVED",
      "Applications Approved"
    ],
    "description": "Counts the number of primary leads that have reached a status of Application Approved. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 74,
    "distinctDescriptions": 15,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "military_rank",
    "displayName": "Military Rank",
    "aliases": [
      "Military Rank"
    ],
    "description": "Displays the resident's rank. Military Rank is found under Resident Profile >> Household >> [Select Primary Resident] >> Summary >> Military Career. This column is only available for clients with the Entrata Military product.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 73,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_denied",
    "displayName": "Applications Denied",
    "aliases": [
      "Applications Denied"
    ],
    "description": "Counts the number of primary leads that have reached a status of Application Partially Completed or Application Completed, (no further), and are cancelled/archived with a denial reason. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 71,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "effective_rent",
    "displayName": "Effective Rent",
    "aliases": [
      "Effective Rent"
    ],
    "description": "Displays the sum of Lease Rent, Recurring Concessions per Lease Term (Months), and One-time Concessions per Lease Term (Months). Month-to-month lease intervals are calculated as the sum of active (at the end of the lease for lease intervals in Past status) recurring Scheduled Charges included in Effective Rent. If no Prior Lease Rent is active at that time, this column will be NULL so that it will not be considered in report averages. This column is not affected by the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 71,
    "distinctDescriptions": 15,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_variance",
    "displayName": "% Variance",
    "aliases": [
      "% Variance"
    ],
    "description": "The $ Variance divided by the budget amount for the listed period.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 69,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "subsidy_rent",
    "displayName": "Subsidy Rent",
    "aliases": [
      "Subsidy Rent"
    ],
    "description": "Displays the subsidy rent amount on the household's certification that is effective as of the end of the period selected. This column is only available for clients with the Entrata Affordable product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 69,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "property_tours",
    "displayName": "Property Tours",
    "aliases": [
      "Property Tours"
    ],
    "description": "All Property Tours logged within the period selected. Deleted, missed, rescheduled, and cancelled tours are excluded. The setting to combine tours as onsite visits will not affect the report. A custom column to combine tours and onsite visits can be added using the formula tool.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 68,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_occupancy",
    "displayName": "Total Occupancy",
    "aliases": [
      "Total Occupancy"
    ],
    "description": "Displays a sum of all columns for each pay grade.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 68,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "unit_tours",
    "displayName": "Unit Tours",
    "aliases": [
      "Unit Tours"
    ],
    "description": "All tours logged within the period selected that have a unit selected. Deleted, missed, rescheduled, and cancelled tours are excluded. The setting to combine tours as onsite visits will not affect the report. A custom column to combine tours and onsite visits can be added using the formula tool.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 67,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_completed_cancelled",
    "displayName": "Application Completed (Cancelled)",
    "aliases": [
      "Application - Completed (Cancelled)",
      "Application Completed (Cancelled)"
    ],
    "description": "Counts the number of primary leads that have reached a status of Application Partially Completed or Application Completed and are cancelled/archived with a reason other than denied. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 66,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leases_completed",
    "displayName": "Leases Completed",
    "aliases": [
      "LEASES COMPLETED",
      "Leases Completed"
    ],
    "description": "Counts the number of primary leads that have reached a status of Lease Completed. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 66,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leases_approved",
    "displayName": "Leases Approved",
    "aliases": [
      "LEASES APPROVED",
      "Leases Approved"
    ],
    "description": "Counts the number of primary leads that have reached a status of Lease Approved. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 63,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "rentable_sqft",
    "displayName": "Rentable Sqft",
    "aliases": [
      "Rentable SQFT",
      "Rentable Sqft"
    ],
    "description": "Displays the total rentable sqft that is available for each displayed suite. This column header is dynamic, and may display 'SQFT', 'M2', or 'Unit of Area', depending on the property's setting for Unit of Measurement.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 61,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "utility_reimbursement",
    "displayName": "Utility Reimbursement",
    "aliases": [
      "Utility Reimbursement"
    ],
    "description": "Displays the utility reimbursement amount on the household's certification that is effective as of the end of the period selected. This column is only available for clients with the Entrata Affordable product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 60,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "payment_amount",
    "displayName": "Payment Amount",
    "aliases": [
      "PAYMENT AMOUNT",
      "Payment Amount"
    ],
    "description": "The PAYMENT AMOUNT column will show the amount of the payment.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 59,
    "distinctDescriptions": 13,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "annual_budget",
    "displayName": "Annual Budget",
    "aliases": [
      "Annual Budget"
    ],
    "description": "The total amount included in the budget for the GL account.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 58,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_approved_cancelled",
    "displayName": "Application Approved (Cancelled)",
    "aliases": [
      "Application - Approved (Cancelled)",
      "Application Approved (Cancelled)"
    ],
    "description": "Counts the number of primary leads that reached a status of Application Approved and are cancelled/archived. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 58,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_approved_cancelled",
    "displayName": "Applications Approved (Cancelled)",
    "aliases": [
      "Applications Approved (Cancelled)"
    ],
    "description": "Counts the number of primary leads that reached a status of Application Approved and are cancelled/archived. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 56,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_scheduled_charges",
    "displayName": "Avg. Scheduled Charges",
    "aliases": [
      "Avg Scheduled Charges",
      "Avg. Scheduled Charges"
    ],
    "description": "Displays an amount that represents the avg. current rent for all occupied or on notice inventory items that are associated to residents as of the end of the user-defined period. This will not consider any rentable items that do not have 'scheduled charges' values (zeroes) within the average.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 56,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_rent",
    "displayName": "Lease Rent",
    "aliases": [
      "Lease Rent"
    ],
    "description": "Displays the monthly (non-prorated) amount of Rent-type scheduled recurring charges and credits that are set to be included in Effective Rent. For most lease intervals, this value will be as of the Lease End date or Move-out date, whichever comes first. For MTM lease intervals, only those in Past status will have this value be as of the Lease End date or Move-out date, whichever comes first. For Current/Notice MTM lease intervals, this value will be as of the day the report is generated. For Future MTM lease interval types, this value will be as of the Lease Start date (since there is no lease end date). If no value is available as of the point in time mentioned, this value will show blank so as to not skew the average Current Lease Rent calculated in the summary. This column is not affected by the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 56,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "onsite_visit",
    "displayName": "Onsite Visit",
    "aliases": [
      "ONSITE VISIT",
      "Onsite Visit"
    ],
    "description": "All onsite visits logged within the period selected. Deleted, missed, rescheduled, and cancelled tours are excluded. The setting to combine tours as onsite visits will not affect the report. A custom column to combine tours and onsite visits can be added using the formula tool.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 56,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_average_row",
    "displayName": "Total/Average (Row)",
    "aliases": [
      "Total/Average (Row)",
      "Total/Average (row)"
    ],
    "description": "Display the total number of unit spaces listed along with the averages for Sqft, Lease Term, Deposit Charged, Deposit Held, Market Rent, Budgeted Rent, Advertised Rate, Scheduled Charges, and Posted Charges",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 56,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "unapplied_credits",
    "displayName": "Unapplied Credits",
    "aliases": [
      "UNAPPLIED CREDITS",
      "Unapplied Credits"
    ],
    "description": "Displays the total amount of unallocated credits (including concessions, deposit credits, etc.) as of the end of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 55,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "deposit_required",
    "displayName": "Deposit Required",
    "aliases": [
      "Deposit Required"
    ],
    "description": "The Deposit Required column will display the deposit that has been setup and assigned to each unit/unit space that is displayed in the report. This column is disabled by default, and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 54,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_change",
    "displayName": "% Change",
    "aliases": [
      "% Change"
    ],
    "description": "This is the variance amount divided by the balance in the Comparative Period balances. This column will only appear when the Compare Periods filter is set to Yes.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 52,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "excluded_units",
    "displayName": "Excluded Units",
    "aliases": [
      "Excluded Units"
    ],
    "description": "Displays the count of excluded units as of the end of the period selected. Excluded units are managed under Setup >> Properties >> [Select Property] >> Property >> Floor Plans & Units >> Units >> [Select a Unit] >> Exclusion. Exclusion reasons include, but are not limited to: Hospitality Unit, Down Unit, Employee Unit, Model Unit, Admin Unit, Corporate Unit, and Construction Unit.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 51,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_of_income",
    "displayName": "% of Income",
    "aliases": [
      "% of Income"
    ],
    "description": "This column displays the line item GL Account total as a percentage of total income.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 49,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "missed_tours",
    "displayName": "Missed Tours",
    "aliases": [
      "Missed Tours"
    ],
    "description": "Displays events of missed, cancelled or rescheduled tour. All tours with an event result of or similar to \"Missed\", \"Cancelled\", or \"Reschuled\" based on the property settings for visit/tour events. Deleted events not included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 49,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "one_time_concessions",
    "displayName": "One-time Concessions",
    "aliases": [
      "One-Time Concessions",
      "One-time (Concessions)",
      "One-time Concessions"
    ],
    "description": "Displays the total value of all scheduled and manual one-time non-Rent-type charges and credits from Charge Codes included in Effective Rent. Charge Codes can be included or excluded from Effective Rent under Setup >> Company >> Financial >> Charge Codes >> [Select Charge Code] >> Include in Effective Rent. This column is not affected by the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 49,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "recurring_concessions",
    "displayName": "Recurring Concessions",
    "aliases": [
      "Recurring (Concessions)",
      "Recurring Concessions"
    ],
    "description": "Displays the total value of all scheduled recurring non-Rent-type charges and credits from Charge Codes included in Effective Rent. Charge Codes can be included or excluded from Effective Rent under Setup >> Company >> Financial >> Charge Codes >> [Select Charge Code] >> Include in Effective Rent. Month-to-month lease intervals do not have scheduled recurring charges total value and therefore, Recurring Concessions is calculated as the sum of scheduled recurring non-Rent-type charges and credits included in Effective Rent as of the MTM Start date. This column is not affected by the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 49,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "active_specials",
    "displayName": "Active Specials",
    "aliases": [
      "Active Specials"
    ],
    "description": "The Active Specials column will display all the active specials that are associated to the displayed unit in a comma separated list. This column will be disabled by default, and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 47,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "delinquency",
    "displayName": "Delinquency",
    "aliases": [
      "Delinquency"
    ],
    "description": "Displays the total amount of unallocated charges that have not been paid as of the end of the period selected. This amount is the sum of Past Due and Current Due.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 47,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "inactive_specials",
    "displayName": "Inactive Specials",
    "aliases": [
      "Inactive Specials"
    ],
    "description": "The Inactive Specials column will display all the inactive specials that are associated to the displayed unit in a comma separated list. This column will be disabled by default, and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 47,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_days_to_tour",
    "displayName": "Avg Days to Tour",
    "aliases": [
      "AVG DAYS TO TOUR",
      "Avg Days to Tour"
    ],
    "description": "Displays the average number of days from Created On to First Visit/Tour for leads. If a lead did not have a tour, then they will not be included in the calculation. If the average time between the leads is 0 then show \"0.00\"",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 46,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_scheduled_rent",
    "displayName": "Avg. Scheduled Rent",
    "aliases": [
      "AVG. SCHEDULED RENT",
      "Avg Scheduled Rent",
      "Avg. Scheduled Rent"
    ],
    "description": "This column will display a monetary value that represents the average SCHEDULED rent amount for occupied units. Scheduled Rent is the amortized total values of all charges and negative charges on the lease interval with charge codes of \"Rent\" type and all usages that have the designation Include In Effective Rent = \"Yes\". Amortized implies that once the total value of each charge is calculated and summed together, it is divided by the lease term length to get a monthly value. Lease term length is found by counting the number of months from lease start to earlier of move-out and lease end, rounded up. All month-to-month lease intervals will pull these same charges, but only pull the charges as of the MTM Start date as opposed to amortizing the total value.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 46,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "first_visits_tours",
    "displayName": "First Visits/Tours",
    "aliases": [
      "First Visits/Tours"
    ],
    "description": "Counts the number of primary leads with an initial onsite visit, property tour, or unit tour listed on the activity log. This column will exclude return visits. Events that are deleted from the activity log will not be included. Events with a missed, cancelled, or reschduled event are not included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 46,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_occupied",
    "displayName": "% Occupied",
    "aliases": [
      "% Occupied",
      "%_Occupied"
    ],
    "description": "The % Occupied column will display the percentage of total units that are occupied (based on the 'as of date' of this section). An occupied unit is defined as any unit that is in an occupied no notice, notice rented, or notice unrented status. This column will not consider excluded units in its calculation",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 45,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bah_rate",
    "displayName": "BAH Rate",
    "aliases": [
      "BAH Rate"
    ],
    "description": "Displays the amount the resident is entitled to based on their year and rank. The BAH Rate is found under Resident Profile >> Household >> [Select Primary Resident] >> Summary >> Military Career >> Rate Protected Amount. This column is only available for clients with the Entrata Military product.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 45,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "outgoing_call",
    "displayName": "Outgoing Call",
    "aliases": [
      "Outgoing Call"
    ],
    "description": "All calls from the property staff to any prospect. Calls that are made to a lead in a Lease Approved/Future Resident status are not counted.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 44,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "referred_contact",
    "displayName": "Referred Contact",
    "aliases": [
      "Referred Contact"
    ],
    "description": "Of the new leads, displays the number of leads that had an Original Contact Method of Referred Contact (contact made through submitting an application through AgentAccess)",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 44,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "accessible_amenities",
    "displayName": "Accessible Amenities",
    "aliases": [
      "Accessible Amenities"
    ],
    "description": "The Accessible Amenities column will display all of the amenities associated to the listed units that are flagged as accessible. The amenities that show up here will not show in the Amenities column, as they would then be listed twice.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 43,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "contract_set_aside",
    "displayName": "Contract/Set-Aside",
    "aliases": [
      "Contract/Set-Aside"
    ],
    "description": "Displays the contract/set-aside that corresponds to the household as of the end of the period selected. If a household is certified under multiple Affordable programs (i.e. both HUD and Tax Credits) then each of those programs would be displayed, separated by commas. This column is only available for clients with the Entrata Affordable product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 43,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "economic_and_physical_occupancy",
    "displayName": "Economic and Physical Occupancy",
    "aliases": [
      "Economic and Physical Occupancy"
    ],
    "description": "This column will display a row for both Economic Occupancy and Physical Occupancy.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 43,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "manual_contacts_attempted",
    "displayName": "Manual Contacts Attempted",
    "aliases": [
      "Manual Contacts Attempted"
    ],
    "description": "Count of all manual contacts attempted by the property to the lead.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 42,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "market_sqft",
    "displayName": "Market/Sqft",
    "aliases": [
      "Market / Sqft",
      "Market/SQFT",
      "Market/Sqft"
    ],
    "description": "The Market/Sqft column will display an amount that represents the market rent amount per sqft of the unit/unit space. This column is disabled by default and can be accessed via the Display Options tab. This column header is dynamic, and may display 'SQFT', 'M2', or 'Unit of Area', depending on the property's setting for Unit of Measurement.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 42,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_completed_cancelled",
    "displayName": "Applications Completed (Cancelled)",
    "aliases": [
      "Applications Completed (Cancelled)"
    ],
    "description": "Counts the number of primary leads that have reached a status of Application Partially Completed or Application Completed and are cancelled/archived with a reason other than denied. For more information click here .",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 41,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "deposit_held_type",
    "displayName": "Deposit Held Type",
    "aliases": [
      "Deposit Held Type"
    ],
    "description": "Displays the type of deposit held. Options include Traditional, 3rd Party, Both, None.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 41,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "economic_occupancy_row",
    "displayName": "Economic Occupancy (Row)",
    "aliases": [
      "Economic Occupancy (Row)"
    ],
    "description": "This displays the economic occupancy for the period as a percentage. This is calculated as (Non-Excluded Market Rent Total + Non-Excluded Vacancy Loss Total) / Non-Excluded Market Rent Total.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 41,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "physical_occupancy_row",
    "displayName": "Physical Occupancy (Row)",
    "aliases": [
      "Physical Occupancy (Row)"
    ],
    "description": "This displays the physical occupancy for the period as a percentage. This is calculated as the total number of occupied units / total number of rentable units.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 41,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "renewal_transfers",
    "displayName": "Renewal Transfers",
    "aliases": [
      "Renewal Transfers"
    ],
    "description": "The Renewal Transfers column will display the leases that have had a renewal transfer performed or will have one performed in the selected period.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 41,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_sqft",
    "displayName": "Avg. Sqft",
    "aliases": [
      "AVG. SQFT",
      "Avg Sqft",
      "Avg. Sqft"
    ],
    "description": "The Avg. Sqft column will display the average square footage of each unit within each unit type/floor plan group. This value should be based on the sqft that has been entered on the unit level and not the unit type level",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 40,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "online_chat",
    "displayName": "Online Chat",
    "aliases": [
      "Online Chat"
    ],
    "description": "All online chats that are taken during the period selected. Chats that are missed or deleted from the activity log will not be included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 40,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "call_analysis_score",
    "displayName": "Call Analysis Score",
    "aliases": [
      "Call Analysis Score"
    ],
    "description": "For those using the Leasing Center product, this column will show the average score of phone call scorecards during the period selected.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 39,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "incoming_call",
    "displayName": "Incoming Call",
    "aliases": [
      "Incoming Call"
    ],
    "description": "All calls from prospects to the property. Missed calls, voicemails, and calls that are received when the lead is in a Lease Approved/Future Resident status are not counted.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 39,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "onsite_visits",
    "displayName": "Onsite Visits",
    "aliases": [
      "Onsite Visits"
    ],
    "description": "All onsite visits logged within the period selected. Deleted, missed, rescheduled, and cancelled tours are excluded. The setting to combine tours as onsite visits will not affect the report. A custom column to combine tours and onsite visits can be added using the formula tool.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 39,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "past_due",
    "displayName": "Past Due",
    "aliases": [
      "PAST DUE",
      "Past Due"
    ],
    "description": "Displays the total amount of unallocated charges due prior to the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 39,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "renewal_lease_approved",
    "displayName": "Renewal Lease Approved",
    "aliases": [
      "Renewal Lease Approved"
    ],
    "description": "Counts the number of leases that have had a renewal lease approved in the period selected",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 38,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "budgeted_sqft",
    "displayName": "Budgeted/Sqft",
    "aliases": [
      "Budgeted/Sqft"
    ],
    "description": "The Budgeted/Sqft column will display an amount that represents the budgeted rent amount per sqft of the unit/unit space This column is disabled by default and can be accessed via the Display Options tab. This column header is dynamic, and may display 'SQFT', 'M2', or 'Unit of Area', depending on the property's setting for Unit of Measurement.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 37,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_neglected_in_first_48_hours",
    "displayName": "% Neglected in First 48 Hours",
    "aliases": [
      "% Neglected in First 48 Hours"
    ],
    "description": "Displays the percent of new leads that were neglected in the first 48 hours of creation.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bed_bath",
    "displayName": "Bed/Bath",
    "aliases": [
      "Bed/Bath"
    ],
    "description": "This column displays the Bedroom and Bathroom count of the unit that was offered to the lead.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "floor_number",
    "displayName": "Floor Number",
    "aliases": [
      "Floor Number"
    ],
    "description": "This column will display the floor number that has been associated to the assigned unit. This information can be found in the setup section under setup, property, floor plans and units, site plans/floors.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "head_of_household",
    "displayName": "Head of Household",
    "aliases": [
      "Head of Household"
    ],
    "description": "This column displays the name of the household member who is flagged as Head of Household (HoH). Clicking on the name of the HoH will bring you to the Lead Summary tab of the lead's profile.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "neglected_in_first_24_hours",
    "displayName": "Neglected in First 24 Hours",
    "aliases": [
      "Neglected in First 24 Hours"
    ],
    "description": "Displays the number of new leads that did not have a manual contact attempted in the first 24 hours. New leads that had a first event of call, visit/tour, or chat will not be included in this count because their first event counts as their successful contact, no additional contact attempt is needed. Manual Contact Attempts include events of: Outbound Email, Outgoing SMS, Outgoing Call, Onsite Visits, Unit Tours, and Property Tours. Outbound Emails/SMS will only be counted if they have been manually sent. Email/SMS Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "neglected_in_first_48_hours",
    "displayName": "Neglected in First 48 Hours",
    "aliases": [
      "Neglected in First 48 Hours"
    ],
    "description": "Displays the number of new leads that did not have a manual contact attempted in the first 48 hours. New leads that had a first event of call, visit/tour, or chat will not be included in this count because their first event counts as their successful contact, no additional contact attempt is needed. Manual Contact Attempts include events of: Outbound Email, Outgoing SMS, Outgoing Call, Onsite Visits, Unit Tours, and Property Tours. Outbound Emails/SMS will only be counted if they have been manually sent. Email/SMS Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "net_change",
    "displayName": "Net Change",
    "aliases": [
      "Net Change"
    ],
    "description": "This column displays the difference between the Beginning and Ending Balance for the listed GL Account.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "renewal_offer_completed",
    "displayName": "Renewal Offer Completed",
    "aliases": [
      "Renewal Offer Completed"
    ],
    "description": "Counts the number of leases that had a renewal offer completed in the period selected.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 36,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "current_due",
    "displayName": "Current Due",
    "aliases": [
      "CURRENT DUE",
      "Current Due"
    ],
    "description": "Displays the total amount of unallocated charges in the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 35,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "floor_title",
    "displayName": "Floor Title",
    "aliases": [
      "Floor Title"
    ],
    "description": "This column will display the floor title that has been associated to the assigned unit. This information can be found in the setup section under setup, property, floor plans and units, site plan/floors.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 35,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "late_fee_formula",
    "displayName": "Late Fee Formula",
    "aliases": [
      "Late Fee Formula"
    ],
    "description": "This column will display the late fee formula name that is associated to each to the active lease that's displayed in the report; This column can potentially display multiple late fee formulas; if that's the case, this column will be a comma separated list. The late fee formula is setup on a property basis and is found under setup, properties, financial, delinquency, late fee formula.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 35,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leased_percent",
    "displayName": "Leased (%)",
    "aliases": [
      "LEASED %",
      "LEASED (%)",
      "Leased %",
      "Leased (%)"
    ],
    "description": "A percentage calculated by taking the count of all Occupied No Notice, Notice Rented, Notice Unrented, and Vacant Rented units divided by the count of all rentable units.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 35,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "space_configuration",
    "displayName": "Space Configuration",
    "aliases": [
      "Space Configuration"
    ],
    "description": "This column displays the Space Configuration that is associated with the unit. This information is not found on the resident profile. It is found under setup, property, floor plans and units, units.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 35,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applications_completed_toured_lead_conversions",
    "displayName": "Applications Completed - Toured Lead Conversions",
    "aliases": [
      "Applications Completed - Toured Lead Conversions"
    ],
    "description": "Displays a count of applications that have toured/visited AND completed an application for the first time. (Partially Completed and Completed Applications are included in the count). This column will depend on the Tour Count filter selection.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "calls_toured_leads_by_original_contact_method",
    "displayName": "Calls - Toured Leads By Original Contact Method",
    "aliases": [
      "Calls - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, AND have a first event of a call. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "chats_toured_leads_by_original_contact_method",
    "displayName": "Chats - Toured Leads By Original Contact Method",
    "aliases": [
      "Chats - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, (tours are defined per the tour count filter), AND have a first event of chat. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "emails_toured_leads_by_original_contact_method",
    "displayName": "Emails - Toured Leads By Original Contact Method",
    "aliases": [
      "Emails - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, AND have a first event of an email. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "future_rent_increases_per_sqft",
    "displayName": "Future Rent Increases - Per Sqft",
    "aliases": [
      "Future Rent Increases - Per SQFT",
      "Future Rent Increases - Per Sqft"
    ],
    "description": "Displays the new per sqft amount for the tenant for each time that their monthly base rent increases; this value will typically increase from their original per sqft amount.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leases_approved_toured_lead_conversions",
    "displayName": "Leases Approved - Toured Lead Conversions",
    "aliases": [
      "Leases Approved - Toured Lead Conversions"
    ],
    "description": "Displays a count of applications that have toured/visited AND had a lease approved in the period selected for the first time. This column will depend on the Tour Count filter.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "moved_in_toured_lead_conversions",
    "displayName": "Moved-In - Toured Lead Conversions",
    "aliases": [
      "Moved-In - Toured Lead Conversions"
    ],
    "description": "Displays a count of applications that have toured/visited AND had a move-in performed. This column will depend on the Tour Count filter selection.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "mtm_conversions",
    "displayName": "MTM Conversions",
    "aliases": [
      "MTM CONVERSIONS",
      "MTM Conversions"
    ],
    "description": "The MTM Conversions column will display the number of MTM households, for each listed unit type/floor plan/property/bedroom count, who renewed onto a full lease. This event must have occurred within the report's date range.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "online_toured_leads_by_original_contact_method",
    "displayName": "Online - Toured Leads By Original Contact Method",
    "aliases": [
      "Online - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, AND have a first event of a guest card from an online source with in the date range. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "other_toured_leads_by_original_contact_method",
    "displayName": "Other - Toured Leads By Original Contact Method",
    "aliases": [
      "Other - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, AND have a first event that does not fit into any of the categories above. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "texts_toured_leads_by_original_contact_method",
    "displayName": "Texts - Toured Leads By Original Contact Method",
    "aliases": [
      "Texts - Toured Leads By Original Contact Method"
    ],
    "description": "The number of leads that have at least one entry on their activity log of a tour per the 'results based on' filter and 'tour count' filter, (tours are defined per the tour count filter), AND have a first event of SMS. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "toured_lead_conversions",
    "displayName": "Toured Lead Conversions",
    "aliases": [
      "Toured Lead Conversions"
    ],
    "description": "Toured Lead Conversion columns are separated into four types of conversion events: applications completed, leases completed, leases approved, move-ins. These columns will count the number of leads that took a tour and then progressed to one or more of these events.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "toured_leads",
    "displayName": "Toured Leads",
    "aliases": [
      "Toured Leads"
    ],
    "description": "Counts the number of primary leads with an initial onsite visit, property tour, or unit tour listed on the activity log. This column will exclude return visits. Events that are deleted from the activity log will not be included. Events with a missed, cancelled, or rescheduled event are not included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "toured_leads_by_original_contact_method",
    "displayName": "Toured Leads By Original Contact Method",
    "aliases": [
      "Toured Leads By Original Contact Method"
    ],
    "description": "Displays a count of applications that have toured/visited AND had a lease approved in the period selected for the first time. This column will depend on the Tour Count filter.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "transaction_amount",
    "displayName": "Transaction Amount",
    "aliases": [
      "TRANSACTION AMOUNT",
      "Transaction Amount"
    ],
    "description": "The line-item transaction amount.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 34,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "visits_tours_toured_leads_by_original_contact_method",
    "displayName": "Visits/Tours - Toured Leads By Original Contact Method",
    "aliases": [
      "Visits/Tours - Toured Leads By Original Contact Method"
    ],
    "description": "The count of leads who have a first event of one of the following: Tour with unit, Tour w/o unit, or onsite visit per the 'results based on' filter and 'tour count' filter. Because the first event is a tour, all leads will be counted. This column is hidden by default.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 34,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "appointments_set",
    "displayName": "APPOINTMENTS SET",
    "aliases": [
      "APPOINTMENTS SET",
      "Appointments Set"
    ],
    "description": "The APPOINTMENTS SET column shows the number of appointments set by the Leasing Center.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "current_balance",
    "displayName": "Current Balance",
    "aliases": [
      "Current Balance"
    ],
    "description": "The Current Balance column displays the balance of the profile as of the date the report is generated. This will include the total of all ledgers and all charge codes.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "current_lease_rent",
    "displayName": "Current Lease Rent",
    "aliases": [
      "Current Lease Rent"
    ],
    "description": "The Current Lease Rent column will display the total of all scheduled rent-type charges on the unit's current lease. If the unit is currently vacant this column will be blank as there is no current lease. This column is OPTIONAL and can be added under the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "first_visit_tour_unit",
    "displayName": "First Visit/Tour Unit",
    "aliases": [
      "First Visit/Tour (Unit)",
      "First Visit/Tour Unit"
    ],
    "description": "This field will display the BLDG-UNITS, (multiple tours can be shown), listed for the first tour, 'Property' if it is a property tour, and 'Onsite Visit' if it is an onsite visit. The setting to combine onsite visit and tour will not affect this field. This information is found on the lead or resident's activity log by searching for the first visit/tour.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "installation_transferring_from",
    "displayName": "Installation Transferring From",
    "aliases": [
      "Installation Transferring From"
    ],
    "description": "This field shows the installation the occupant is transferring from. Found under Resident Profile>> Household>> Summary>> Edit Military Career>> Installation Transferring From (this is labeled as 'Last Assignment' on the resident profile). For Leads this field can be found under Lead Profile>> Application>> Military.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "warrant_officer_candidate",
    "displayName": "Warrant Officer Candidate",
    "aliases": [
      "Warrant Officer Candidate"
    ],
    "description": "Displays if the occupants a warrant officer (yes/no). This field is found under the Resident Profile>> Household>> Summary>> Edit Military Career>> For Leads this field can be found under Lead Profile>> Application>> Military.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 33,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "beginning_balance",
    "displayName": "Beginning Balance",
    "aliases": [
      "BEGINNING BALANCE",
      "Beginning Balance"
    ],
    "description": "Sum of the GL transactions for the specified GL account as of the beginning of the starting post month.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 32,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "prior_effective_rent",
    "displayName": "Prior Effective Rent",
    "aliases": [
      "Prior Effective Rent"
    ],
    "description": "This column displays the amortized total value of all charges, negative charges, and credits on the prior lease interval before renovation with charge codes that have the designation Include In Effective Rent = \"Yes\". Amortized implies that once the total value of each charge is calculated and summed together, it is divided by the lease term length found in the Prior Term column to get a monthly value.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 32,
    "distinctDescriptions": 11,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "quote_generated",
    "displayName": "Quote Generated",
    "aliases": [
      "Quote Generated"
    ],
    "description": "This column display the date the quote was created on",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 32,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "number_of_late_payments",
    "displayName": "# of Late Payments",
    "aliases": [
      "# of Late Payments"
    ],
    "description": "This column will display the total count of the times that the resident was late in making a payment. This information is found in the resident profile under household, people, click on the persons's name, # of late payments.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "number_of_nsf_s",
    "displayName": "# of NSF's",
    "aliases": [
      "# of NSF's"
    ],
    "description": "This column will display the total count of NSFs that are associated to the resident. This information is not shown in the resident or lead profile.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "0_30_days",
    "displayName": "0-30 Days",
    "aliases": [
      "0-30 DAYS",
      "0-30 Days"
    ],
    "description": "Displays the portion of Unallocated Charges / Credits due 0-30 days prior to the end of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_preferences_bathrooms",
    "displayName": "Application Preferences Bathrooms",
    "aliases": [
      "Application Preferences Bathrooms"
    ],
    "description": "Shows the lead's preferred number of bathrooms as listed on the guest card. This information is shown on the lead profile on the right-hand side under preferences.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_preferences_bedrooms",
    "displayName": "Application Preferences Bedrooms",
    "aliases": [
      "Application Preferences Bedrooms"
    ],
    "description": "Shows the lead's preferred number of bedrooms as listed on the guest card. This information is shown on the lead profile on the right-hand side under preferences.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_preferences_rent_max",
    "displayName": "Application Preferences Rent Max",
    "aliases": [
      "Application Preferences Rent Max"
    ],
    "description": "Shows the lead's preferred maximum rent amount as listed on the guest card. This information is shown on the lead profile on the right-hand side under preferences.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_preferences_rent_min",
    "displayName": "Application Preferences Rent Min",
    "aliases": [
      "Application Preferences Rent Min"
    ],
    "description": "Shows the lead's preferred minimum rent amount as listed on the guest card. This information is shown on the lead profile on the right-hand side under preferences.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "beds",
    "displayName": "Beds",
    "aliases": [
      "Beds"
    ],
    "description": "This column displays the bedroom count associated to the listed floor plan.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "employment_income_annual",
    "displayName": "Employment Income (Annual)",
    "aliases": [
      "Employment Income (Annual)"
    ],
    "description": "This column displays the total current salary for all employement entries for each person on an ANNUAL basis. This information is found on the resident profile under household, income, current income or on the lead profile on the application under the financial section. It includes all types of incomes including disability, annuities, ect. Again, the income shown is on an annual basis.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_utilities",
    "displayName": "Lease Utilities",
    "aliases": [
      "Lease Utilities"
    ],
    "description": "Lists the utilities a resident is responsible to pay, (in a comma separated list if they are responsible for more than one). This information is found on the profile under Scheduled Charges and Credits, Lease Utilities.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "manual_contact_attempted",
    "displayName": "Manual Contact Attempted",
    "aliases": [
      "Manual Contact Attempted"
    ],
    "description": "Events of: Outbound Email, Outbound SMS, Outbound Call, Onsite Visits, Unit Tours, Property Tours that took place in the period selected on the leads listed in the New Leads column. Outbound Emails/Texts will only be counted if they have been manually sent. Email/Texts Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "manual_contact_attempted_in_first_24_hours",
    "displayName": "Manual Contact Attempted In First 24 Hours",
    "aliases": [
      "Manual Contact Attempted In First 24 Hours",
      "Manual Contact Attempted in First 24 Hours"
    ],
    "description": "Displays the number of new leads that have a manual contact attempted within the first 24 hours of guest card creation. Leads with an original contact method of call, visit/tour, or chat should also be counted in this column as having a manual contact attempted. Manual Contact Attempts include events of: Outbound Email, Outgoing SMS, Outgoing Call, Onsite Visits, Unit Tours, and Property Tours. Outbound Emails/SMS will only be counted if they have been manually sent. Email/SMS Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "manual_contact_attempted_in_first_48_hours",
    "displayName": "Manual Contact Attempted In First 48 Hours",
    "aliases": [
      "Manual Contact Attempted In First 48 Hours",
      "Manual Contact Attempted in First 48 Hours",
      "manual Contact Attempted in First 48 Hours"
    ],
    "description": "Displays the number of new leads that have a manual contact attempted within the first 48 hours of guest card creation. Leads with an original contact method of call, visit/tour, or chat should also be counted in this column as having a manual contact attempted. Manual Contact Attempts include events of: Outbound Email, Outgoing SMS, Outgoing Call, Onsite Visits, Unit Tours, and Property Tours. Outbound Emails/SMS will only be counted if they have been manually sent. Email/SMS Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "student_financial_assistance",
    "displayName": "Student Financial Assistance",
    "aliases": [
      "Student Financial Assistance"
    ],
    "description": "This column displays the annual student financial assistance amount as entered on the application. This information is found in the lead profile on the application under financial, student financial assistance, gross income.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 31,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "ending_balance",
    "displayName": "Ending Balance",
    "aliases": [
      "ENDING BALANCE",
      "Ending Balance"
    ],
    "description": "The ENDING BALANCE column displays the balance of the ledger as of the last day of the selected period/month.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 30,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "exposure_percent",
    "displayName": "Exposure (%)",
    "aliases": [
      "EXPOSURE (%)",
      "Exposure %",
      "Exposure (%)"
    ],
    "description": "A percentage calculated by taking the count of all Notice Unrented and Vacant Unrented units divided by the count of total units as of the end of the designated week.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "high",
    "ambiguity": "low",
    "usageCount": 30,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bedrooms",
    "displayName": "Bedrooms",
    "aliases": [
      "Bedrooms"
    ],
    "description": "Displays the number of bedrooms in the unit. Units are managed under Setup >> Properties >> [Select Property] >> Floor Plans & Units >> Units >> [Select Unit].",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 29,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "est_vacancy_cost",
    "displayName": "Est. Vacancy Cost",
    "aliases": [
      "Est. Vacancy Cost"
    ],
    "description": "The Est. Vacancy Cost column will display a monetary value that represents an estimated (not 100% accurate) vacancy cost/loss based on the previous household's move-out date and the number of days the unit has been vacant.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 29,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "future_lease_rent",
    "displayName": "Future Lease Rent",
    "aliases": [
      "Future Lease Rent"
    ],
    "description": "The Future Lease Rent column will display the scheduled rent charge value of the upcoming lease for units in a vacant rented status. This column is disabled by default, and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 29,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leases_expiring",
    "displayName": "Leases Expiring",
    "aliases": [
      "Leases Expiring"
    ],
    "description": "Calculated as follows: MTM Started + Move-outs + Renewals + Evictions Completed.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 29,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "occupied_sqft",
    "displayName": "Occupied Sqft",
    "aliases": [
      "Occupied SQFT",
      "Occupied Sqft"
    ],
    "description": "The square footage of all occupied units at the property as of the end of the designated week.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 29,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "payment_number",
    "displayName": "Payment #",
    "aliases": [
      "PAYMENT #",
      "Payment #"
    ],
    "description": "This column displays the associated payment #.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 29,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "baths",
    "displayName": "Baths",
    "aliases": [
      "Baths"
    ],
    "description": "This column displays the bathroom count associated to the listed floor plan.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "best_price",
    "displayName": "Best Price",
    "aliases": [
      "Best Price"
    ],
    "description": "The Best Price column will display a value representing the lowest pricing value, regardless of the lease term, as of the unit's available on date or today's date (if the available on date has passed the current calendar date). This column should be blank for any vacant rented, notice rented, and occupied no notice units. This column is disabled by default and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "best_price_term",
    "displayName": "Best Price Term",
    "aliases": [
      "Best Price Term"
    ],
    "description": "The Best Price Term column will display the lease term (in months) that is associated to the value displayed within the best price column. This column should be blank for any vacant rented, notice rented, and occupied no notice units. This column is disabled by default and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "future_scheduled_credits_amount",
    "displayName": "Future Scheduled Credits - Amount",
    "aliases": [
      "Future Scheduled Credits - Amount"
    ],
    "description": "Displays the amount of the credit.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "future_scheduled_credits_charge_timing",
    "displayName": "Future Scheduled Credits - Charge Timing",
    "aliases": [
      "Future Scheduled Credits - Charge Timing"
    ],
    "description": "Displays the timing that is associated to the credit.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "net_effective_rent",
    "displayName": "Net Effective Rent",
    "aliases": [
      "Net Effective Rent"
    ],
    "description": "Displays the total value of all scheduled recurring, scheduled one-time, and manual one-time charges and credits included in Effective Rent amortized over the occupied length of the lease interval. Charge Codes can be included/excluded from Effective Rent under Setup >> Company >> Financial >> Charge Codes >> [Select Charge Code] >> Include in Effective Rent. Occupied lease length is the best approximation of when scheduled charges start and end on a lease interval and best accounts for early move-ins, early move-outs, and transfers. Month-to-month lease interval do not have scheduled recurring charges total value or occupied lease length calculated and therefore, are calculated as the sum of scheduled and manual charges and credits included in Effective Rent as of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_actual_charges",
    "displayName": "Scheduled Charges - Actual Charges",
    "aliases": [
      "Scheduled Charges - Actual Charges"
    ],
    "description": "Displays the amount that was actually charged to the tenant associated to the listed charge code(s) during the user-defined period.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_actual_nnn",
    "displayName": "Scheduled Charges - Actual NNN",
    "aliases": [
      "Scheduled Charges - Actual NNN"
    ],
    "description": "Displays an amount, for each listed tenant, that represents the sum of the \"Actual NNN CAM,\" \"Actual NNN Taxes,\" and \"Actual NNN Insurance\" columns.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_actual_nnn_cam",
    "displayName": "Scheduled Charges - Actual NNN CAM",
    "aliases": [
      "Scheduled Charges - Actual NNN CAM"
    ],
    "description": "Displays the total amount of all CAM charges within the post month selected that actually posted. This column will pull in charges originated from the Lease > Triple-Net > CAM Pools section on the resident's profile AND charges that have a charge code usage of CAM.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_actual_nnn_insurance",
    "displayName": "Scheduled Charges - Actual NNN Insurance",
    "aliases": [
      "Scheduled Charges - Actual NNN Insurance"
    ],
    "description": "Displays the total amount of all insurance charges within the post month selected that actually posted. This column should ONLY pull in charges originated from the Lease > Triple-Net > Insurance section on the resident's profile.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_actual_nnn_taxes",
    "displayName": "Scheduled Charges - Actual NNN Taxes",
    "aliases": [
      "Scheduled Charges - Actual NNN Taxes"
    ],
    "description": "Displays the total amount of all tax charges within the post month selected that actually posted. This column should ONLY pull in charges originated from the Lease > Triple-Net > Taxes section of the resident's profile.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_annual_charge_sqft",
    "displayName": "Scheduled Charges - Annual Charge / Sqft",
    "aliases": [
      "Scheduled Charges - Annual Charge / Sqft"
    ],
    "description": "Displays the annual charges divided by the sqft of each tenant. If the tenant is occupying multiple suites, this column should display Annual Charges / Total SQFT of all suites occupied by the tenant.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_annual_charges",
    "displayName": "Scheduled Charges - Annual Charges",
    "aliases": [
      "Scheduled Charges - Annual Charges"
    ],
    "description": "Displays the annualized charges for each tenant displayed. This is calculated by taking the monthly sum of all scheduled charges and multiplying it by 12.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_expire",
    "displayName": "Scheduled Charges - Expire",
    "aliases": [
      "Scheduled Charges - Expire"
    ],
    "description": "Display the date that the tenant's rent is set to expire on their ledger.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_monthly_base_rent",
    "displayName": "Scheduled Charges - Monthly Base Rent",
    "aliases": [
      "Scheduled Charges - Monthly Base Rent"
    ],
    "description": "Displays the base rent amount that is charged to the tenant that's displayed.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_monthly_utilities",
    "displayName": "Scheduled Charges - Monthly Utilities",
    "aliases": [
      "Scheduled Charges - Monthly Utilities"
    ],
    "description": "Displays an amount, for each listed tenant, that represents the total amount of all utility charges within the post month selected. This column should ONLY pull in charges originated from the Lease > Triple-Net > utility section on the tenant's profile.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_other_monthly_charges",
    "displayName": "Scheduled Charges - Other Monthly Charges",
    "aliases": [
      "Scheduled Charges - Other Monthly Charges"
    ],
    "description": "Displays any other charges that are associated to the tenant's lease. This will exclude anything displayed in the base rent column, CAM charges column, taxes, utilities, and insurance.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_charges",
    "displayName": "Scheduled Charges - Scheduled Charges",
    "aliases": [
      "Scheduled Charges - Scheduled Charges"
    ],
    "description": "Displays the amount of the scheduled charge(s) associated to the listed charge code(s).",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_charges_sqft",
    "displayName": "Scheduled Charges - Scheduled Charges / Sqft",
    "aliases": [
      "Scheduled Charges - Scheduled Charges / Sqft"
    ],
    "description": "Displays the sum of all monthly scheduled charges of each tenant divided by the rentable sqft of the suite.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_nnn",
    "displayName": "Scheduled Charges - Scheduled NNN",
    "aliases": [
      "Scheduled Charges - Scheduled NNN"
    ],
    "description": "Displays an amount, for each listed tenant, that represents the sum of the \"Scheduled NNN CAM,\" \"Scheduled NNN Taxes,\" and \"Scheduled NNN Insurance\" columns.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_nnn_cam",
    "displayName": "Scheduled Charges - Scheduled NNN CAM",
    "aliases": [
      "Scheduled Charges - Scheduled NNN CAM"
    ],
    "description": "Displays the total amount of all CAM charges within the post month selected that were scheduled to post. This column will pull in charges originated from the Lease > Triple-Net > CAM Pools section on the resident's profile AND charges that have a charge code usage of CAM.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_nnn_insurance",
    "displayName": "Scheduled Charges - Scheduled NNN Insurance",
    "aliases": [
      "Scheduled Charges - Scheduled NNN Insurance"
    ],
    "description": "Displays the total amount of all insurance charges within the post month selected that were scheduled to post. This column should ONLY pull in charges originated from the Lease > Triple-Net > Insurance section on the resident's profile.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_scheduled_nnn_taxes",
    "displayName": "Scheduled Charges - Scheduled NNN Taxes",
    "aliases": [
      "Scheduled Charges - Scheduled NNN Taxes"
    ],
    "description": "Display the total amount of all tax charges within the post month selected that were scheduled to post. This column should ONLY pull in charges originated from the Lease > Triple-Net > Taxes section of the resident's profile.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_start",
    "displayName": "Scheduled Charges - Start",
    "aliases": [
      "Scheduled Charges - Start"
    ],
    "description": "Displays the date that the tenant's rent is set to start posting on their ledger.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_inventory",
    "displayName": "Total Inventory",
    "aliases": [
      "Total Inventory"
    ],
    "description": "Displays the number of inventory entries that have been added to each listed 'Option' as of the end of the user-defined period. NOTE: If an 'Option' has been setup where it contains no inventory then this column will be blank for all such Options.\"",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_scheduled_charges",
    "displayName": "Total Scheduled Charges",
    "aliases": [
      "Total Scheduled Charges"
    ],
    "description": "Displays an amount that represents the total current rent for all occupied or on notice inventory items that is associated to the resident as of the end of the user-defined period. The 'Scheduled Charges' for this report is being considered as the recurring charge that was shown as of the end of the user-defined period.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 28,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "advertised_rate",
    "displayName": "Advertised Rate",
    "aliases": [
      "Advertised Rate"
    ],
    "description": "Displays the advertised rate when the lease was executed based on the applicant/resident's unit type, lease term, and space option selection. If the lease has yet to be executed, show the advertised rate as of the day the report is run.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_advertised_rate",
    "displayName": "Avg Advertised Rate",
    "aliases": [
      "Avg Advertised Rate",
      "Avg. Advertised Rate"
    ],
    "description": "Displays the average advertised rate for the unit spaces considered pre-leased in each row.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "charge_timing",
    "displayName": "Charge Timing",
    "aliases": [
      "Charge Timing"
    ],
    "description": "Displays the charge timing of the charge as shown in the Resident Profile >> Financial >> Scheduled Charges and Credits >> Charge Timing",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "credits_concessions",
    "displayName": "Credits / Concessions",
    "aliases": [
      "CREDITS/CONCESSIONS",
      "Credits / Concessions"
    ],
    "description": "Displays the amount of credits allocated to charges in the period selected and charges allocated to credits in the period selected. This column should not include negative payments allocated to credits.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "last_delinquency_note",
    "displayName": "Last Delinquency Note",
    "aliases": [
      "Last Delinquency Note"
    ],
    "description": "Displays the most current delinquent note along with the creation datetime and username on the resident's activity log, based on a date range determined by the oldest unallocated transaction and the end of the period selected. Nothing prior to the oldest unallocated transaction will be shown.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "per_sqft",
    "displayName": "Per Sqft",
    "aliases": [
      "Per SQFT",
      "Per Sqft"
    ],
    "description": "The Per Sqft column will display the new per sqft amount for the tenant for each time that their monthly base rent increases; this value will typically increase from their original per sqft amount. This column will fall under the 'future rent increases' master column header. This column header is dynamic, and may display 'SQFT', 'M2', or 'Unit of Area', depending on the property's setting for Unit of Measurement.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 27,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_calls",
    "displayName": "Total Calls",
    "aliases": [
      "Total Calls",
      "Total calls"
    ],
    "description": "Total Calls show the total number of corporate care calls for all issue types. This will also be a total of the 'resolved' and 'unresolved' column counts.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 27,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "beginning_deposit_held",
    "displayName": "Beginning Deposit Held",
    "aliases": [
      "BEGINNING DEPOSIT HELD",
      "Beginning Deposit Held"
    ],
    "description": "The BEGINNING DEPOSIT HELD column displays the balance (amount held) of the DEPOSIT ledger as of the last day of the period/month prior to the selected period/month. This column will ONLY display when the 'Deposits' filter is set to 'Show'.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "completed_applications",
    "displayName": "Completed Applications",
    "aliases": [
      "COMPLETED APPLICATIONS",
      "Completed Applications"
    ],
    "description": "Count of Completed Applications in the period",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 26,
    "distinctDescriptions": 10,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "current_budget",
    "displayName": "Current Budget",
    "aliases": [
      "Current Budget"
    ],
    "description": "Original budget plus the change orders.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "current_collections",
    "displayName": "Current Collections",
    "aliases": [
      "CURRENT COLLECTIONS",
      "Current Collections"
    ],
    "description": "Displays the amount of cash/receipts that have been collected in the period which were also allocated against Charges Due in the period.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "occupied_percent",
    "displayName": "Occupied (%)",
    "aliases": [
      "OCCUPIED (%)",
      "Occupied %",
      "Occupied (%)",
      "Occupied - %"
    ],
    "description": "Calculated as follows: Occupied / Rentable Units.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "prior_collections",
    "displayName": "Prior Collections",
    "aliases": [
      "PRIOR COLLECTIONS",
      "Prior Collections"
    ],
    "description": "Displays the amount of cash/receipts that were collected in prior periods which where allocated against Charges Due in the period.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "prior_recurring_concessions",
    "displayName": "Prior Recurring Concessions",
    "aliases": [
      "Prior Recurring Concessions"
    ],
    "description": "Displays the total value of all scheduled recurring non-Rent-type charges and credits from Charge Codes included in Effective Rent on the Prior Lease interval. Charge Codes can be included or excluded from Effective Rent under Setup >> Company >> Financial >> Charge Codes >> [Select Charge Code] >> Include in Effective Rent. Month-to-month lease intervals do not have scheduled recurring charges total value and therefore, Recurring Concessions is calculated as the sum of scheduled recurring non-Rent-type charges and credits included in Effective Rent as of the MTM Start date.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "sqft_avg",
    "displayName": "Sqft (Avg)",
    "aliases": [
      "Sqft (Avg)"
    ],
    "description": "Displays the average area of the units. Area is managed at the unit level under Setup >> Properties >> [Select Property] >> Property >> Floor Plans & Units >> Units >> [Select Unit] >> General >> Square Feet. The column name and value are dynamic and adjust automatically based on Setup >> Property >> [select a property] >> Property >> General >> Details >> Unit of Measure - Area. If the Unit of Measure field is set to Square Feet, then the column shows Sqft. If it's set to Square Meters, then the column shows M2. If the report is generated for multiple properties with different Unit of Measure settings, then the column shows Unit of Area.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 26,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "number_of_animals",
    "displayName": "# of Animals",
    "aliases": [
      "# of Animals"
    ],
    "description": "Displays the total number of current (we don't show past pets) pets associated to a household. This information can be found on the resident profile under lease, pets. It can be found on the lead profile in the application under gerenral, pets.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "90_days",
    "displayName": "90+ Days",
    "aliases": [
      "90  Days",
      "90+ Days"
    ],
    "description": "Displays the portion of Unallocated Charges / Credits due more than 90 days prior to the end of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "appointments_set_percent",
    "displayName": "Appointments Set %",
    "aliases": [
      "APPOINTMENTS SET %",
      "Appointments Set %"
    ],
    "description": "Number of appointments set divided by the number of leads created.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "assigned_to",
    "displayName": "Assigned To",
    "aliases": [
      "Assigned To"
    ],
    "description": "The current person the work order is assigned to.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "charge_amount",
    "displayName": "Charge Amount",
    "aliases": [
      "CHARGE AMOUNT",
      "Charge Amount"
    ],
    "description": "Displays the amount that the the resident is being charged for the specified Charge Code.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 7,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "per_sq_ft",
    "displayName": "Per Sq.Ft.",
    "aliases": [
      "Per Sq.Ft."
    ],
    "description": "This column divides the Actual total for the defined period, and divides it by the total rentable square feet for the property. Note: Total Rentable Square Feet does not include Excluded units. This column can be added to the selected period, QTD, and YTD sections.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "per_unit",
    "displayName": "Per Unit",
    "aliases": [
      "Per Unit"
    ],
    "description": "This column divides the Actual total for the defined period, QTD, or YTD, and divides it by the total rentable units for the property. Note: Rentable Units do not include Excluded units. This column can be added to the selected period, QTD, and YTD sections.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "write_off_percent",
    "displayName": "Write-Off %",
    "aliases": [
      "Write-Off %"
    ],
    "description": "This column displays the % of the total activity for each GL that came from charges being written off to bad debt. This column can be added to the selected period, QTD, and YTD sections.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 25,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_accepted",
    "displayName": "% Accepted",
    "aliases": [
      "% Accepted"
    ],
    "description": "Calculated as follows: (Offers Accepted / Offers) * 100.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 24,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bank_name",
    "displayName": "Bank Name",
    "aliases": [
      "Bank Name"
    ],
    "description": "This column displays the Bank Name for the associated payment. This column can only be enabled in Display Options when Summarize = No.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 24,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "leases_completed_cancelled",
    "displayName": "Leases Completed (Cancelled)",
    "aliases": [
      "Leases Completed (Cancelled)"
    ],
    "description": "Counts the number of primary leads that reached a status of Lease Completed and are cancelled/archived. For more information click here",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 24,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "moved_in",
    "displayName": "Moved In",
    "aliases": [
      "MOVED IN",
      "Moved In"
    ],
    "description": "Counts the number of leads that have had a move-in processed.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 24,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "successful_contacts",
    "displayName": "Successful Contacts",
    "aliases": [
      "Successful Contacts"
    ],
    "description": "\"Displays the number of successful contacts made by Leasing Agents to leads listed in the Manual Contacts Prompted column. A successful contact is considered verified communication with a lead and will include events of: inbound emails, inbound calls, outbound calls (with a result of completed), onsite visits(with a result of completed), unit tours(with a result of completed), and property tours(with a result of completed), within the period selected will be counted.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 24,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_of_total",
    "displayName": "% Of Total",
    "aliases": [
      "% Of Total",
      "% Of total",
      "% of Total"
    ],
    "description": "This column will display a percentage of the total number of policies for each policy carrier listed",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 23,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "approved_percent",
    "displayName": "Approved (%)",
    "aliases": [
      "Approved (%)",
      "Approved - %"
    ],
    "description": "Displays the percent of rentable units that have unit spaces that will be occupied with applicants in a Approved status.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 23,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "completed_percent",
    "displayName": "Completed (%)",
    "aliases": [
      "Completed (%)",
      "Completed - %"
    ],
    "description": "Displays the percent of rentable units that have unit spaces that will be occupied with applicants in a Completed status.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 23,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "outstanding_delinquency",
    "displayName": "Outstanding Delinquency",
    "aliases": [
      "Outstanding Delinquency"
    ],
    "description": "Displays the Delinquency amount of the prior period. This column will only show when Include Outstanding Delinquency filter is set to Yes and drills into the Delinquency report for the prior period. If period selected is a date then, this will tie out to the Delinquency amount found in the Delinquency report for the last day of the prior calendar month. If period selected is a post month, then this will tie out to the Delinquency amount found in the Delinquency report for the prior post month.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 23,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "remaining_budget",
    "displayName": "Remaining Budget",
    "aliases": [
      "REMAINING BUDGET",
      "Remaining Budget"
    ],
    "description": "Displays how much of the total budget is remaining after the transaction is posted.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 23,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "amenity_rent",
    "displayName": "Amenity Rent",
    "aliases": [
      "Amenity Rent"
    ],
    "description": "The Amenity Rent column will display the total value of all assigned amenities for each unit. If amenities are assigned but have no rent then this column will be blank. This column is disabled by default, and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 22,
    "distinctDescriptions": 9,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_change",
    "displayName": "Avg. Change ($)",
    "aliases": [
      "Avg Change ($)",
      "Avg. $ Change",
      "Avg. Change ($)"
    ],
    "description": "Based on what is selected in the Compare filter, displays the difference between the two average rents selected to compare in a dollar amount",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 22,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "deposit_number",
    "displayName": "Deposit Number",
    "aliases": [
      "DEPOSIT NUMBER",
      "Deposit Number"
    ],
    "description": "Displays the system generated bank deposit number.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "medium",
    "usageCount": 22,
    "distinctDescriptions": 8,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_approved_percent",
    "displayName": "Lease Approved %",
    "aliases": [
      "Lease Approved %"
    ],
    "description": "Lease Approved / Leads Created",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 22,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_percent",
    "displayName": "Percent (%)",
    "aliases": [
      "Percent (%)"
    ],
    "description": "Displays the percentage of the sqft listed for each status in comparison to the total square footage.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 22,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "total_collections",
    "displayName": "Total Collections",
    "aliases": [
      "TOTAL COLLECTIONS",
      "Total Collections"
    ],
    "description": "Displays the amount of all cash/receipts collected and credits / concessions allocated in the period selected. Calculated as follows: Total Cash Collections + Credits / Concessions.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 22,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "91_120_days",
    "displayName": "91-120 Days",
    "aliases": [
      "91-120 DAYS",
      "91-120 Days"
    ],
    "description": "Displays the portion of Unallocated Charges / Credits due 91-120 days prior to the end of the period selected.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_rentable_sqft",
    "displayName": "Avg Rentable Sqft",
    "aliases": [
      "Avg Rentable Sqft"
    ],
    "description": "Displays the average area of measure for the rentable unit spaces considered in each row.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "avg_current_rent",
    "displayName": "Avg. Current Rent",
    "aliases": [
      "Avg Current Rent",
      "Avg. Current Rent"
    ],
    "description": "For offers accepted, displays the average Current Rent.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "partially_completed_percent",
    "displayName": "Partially Completed (%)",
    "aliases": [
      "Partially Completed (%)"
    ],
    "description": "Displays the percent of rentable units that have unit spaces that will be occupied with applicants in a Partially Completed status.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "pre_leased_percent",
    "displayName": "Pre-Leased (%)",
    "aliases": [
      "Pre-Leased (%)"
    ],
    "description": "Displays the percent of rentable units that have unit spaces that will be occupied with applicants in a status that is at least the status selected in the Consider Pre-Leased filter or higher.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "started_percent",
    "displayName": "Started (%)",
    "aliases": [
      "Started (%)"
    ],
    "description": "Displays the percent of rentable units that have unit spaces that will be occupied with applicants in a Started status.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "unit_of_area",
    "displayName": "Unit of Area",
    "aliases": [
      "Unit of Area"
    ],
    "description": "The UNIT OF AREA column displays the square feet or square meters of the unit that is being renovated and is dynamic based on the the Units of Measure setting for Area in property settings. This column will display SQFT if the property is set to Square Feet, M2 if the property is set to Square Meter, and Unit of Area if the report is generated for multiple properties with different units of area.",
    "fieldKind": "metric",
    "dataType": "number",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 21,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_delinquent",
    "displayName": "% Delinquent",
    "aliases": [
      "% Delinquent"
    ],
    "description": "Displays the percent of Charges Due not yet collected on in the period. Calculated as follows: Delinquency / Charges Due",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_neglected_in_first_24_hours",
    "displayName": "% Neglected in First 24 Hours",
    "aliases": [
      "% Neglected in First 24 Hours"
    ],
    "description": "Displays the percent of new leads that were neglected in the first 24 hours of creation.",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "percent_neglected_lead",
    "displayName": "% Neglected Lead",
    "aliases": [
      "% Neglected Lead"
    ],
    "description": "Displays the percent of how many new leads remained neglected at the end of the period",
    "fieldKind": "metric",
    "dataType": "percent",
    "primaryTopic": "percent",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "actual_charges_avg",
    "displayName": "Actual Charges (Avg)",
    "aliases": [
      "Actual Charges (Avg)"
    ],
    "description": "Displays the average Actual Charges of occupied units. Actual Charges is the sum of all charges that have been posted in the period selected based on the charge codes selected in the Charge Codes filter.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "applied_deposits",
    "displayName": "Applied Deposits",
    "aliases": [
      "Applied Deposits"
    ],
    "description": "Displays any deposits applied to charges in the Charges Due column. It will always show deposits applied to the charge amount listed in the Charges Due column. Because the Charges Due changes depending on the Include Outstanding Delinquency filter selection, this value will also change. When set to \"Yes\", the amount will tie out to the Applied to Charges amount in the Resident Deposit Audit report.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "budgeted_rent_avg",
    "displayName": "Budgeted Rent (Avg)",
    "aliases": [
      "Budgeted Rent (Avg)"
    ],
    "description": "Displays the average Budgeted Rent of rentable units. Budgeted Rent is the amount at which the unit is budgeted as of the end of the period selected as found under Setup >> Properties >> [Select Property] >> Pricing >> Rent >> Budgeted Rent. Clients who use this column should also have Budgeted Rent selected for the Determine Market Rent setting found under Setup >> Properties >> [Select Property] >> Financial >> Gross Potential Rent.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "cash_balances",
    "displayName": "Cash Balances",
    "aliases": [
      "Cash Balances"
    ],
    "description": "This column will only appear if the Beginning/Ending Cash Balances Details filter is set to Hide. This is due to the cash accounts being hidden and the Account Name column not appearing.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "effective_rent_avg",
    "displayName": "Effective Rent (Avg)",
    "aliases": [
      "Effective Rent (Avg)"
    ],
    "description": "Displays the average Effective Rent of occupied units. Effective Rent is the total value of all scheduled recurring and one-time charges and credits from Charge Codes included in Effective Rent amortized over the occupied length of the lease interval. Charge Codes can be included or excluded from Effective Rent under Setup >> Company >> Financial >> Charge Codes >> [Select Charge Code] >> Include in Effective Rent. Occupied lease length is the best approximation of when scheduled charges start and end on a lease interval and best accounts for early move-ins, early move-outs, and transfers. Month-to-month lease intervals do not have scheduled recurring charges total value or occupied lease length calculated and therefore, Effective Rent is calculated as the sum of scheduled charges and credits included in Effective Rent as of the MTM Start date.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "incoming_calls",
    "displayName": "Incoming Calls",
    "aliases": [
      "INCOMING CALLS",
      "Incoming Calls",
      "Incoming calls"
    ],
    "description": "All calls from prospects to the property. Missed calls, voicemails, and calls that are received when the lead is in a Lease Approved/Future Resident status are not counted.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "lease_signed",
    "displayName": "Lease Signed",
    "aliases": [
      "Lease Signed"
    ],
    "description": "Counts the number of leads that have finished signing their portion of the lease. This column counts the signing of the most recent lease, (instead of the initial lease), and therefore will not tie-out to other reports if a lease has been cancelled.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "manual_contact_per_lead",
    "displayName": "Manual Contact Per Lead",
    "aliases": [
      "Manual Contact Per Lead"
    ],
    "description": "Calculated as follows: Manual Contact Attempted divided by New Leads.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "market_rent_avg",
    "displayName": "Market Rent (Avg)",
    "aliases": [
      "Market Rent (Avg)"
    ],
    "description": "Displays the average Market Rent of rentable units. Market Rent is the amount at which the unit is advertised as of the end of the period selected as found under Setup >> Properties >> [Select Property] >> Pricing >> Rent >> Historical Rents (Rate Logs). Clients who use this column should also have Market Rent selected for the Determine Market Rent setting found under Setup >> Properties >> [Select Property] >> Financial >> Gross Potential Rent.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "max_pets",
    "displayName": "Max Pets",
    "aliases": [
      "Max Pets"
    ],
    "description": "The MAX PETS column will display the maximum number of pets (as entered within unit/space setup) for each listed unit. This column is disabled by default, and can be accessed via the Display Options tab",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "monthly_cam",
    "displayName": "Monthly CAM",
    "aliases": [
      "MONTHLY CAM",
      "Monthly CAM"
    ],
    "description": "Displays the total amount of unallocated CAM (common area maintenance) usage charges for the tenant as of the end of the period selected. This column is specific to clients with the Entrata Commercial product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 6,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "monthly_nnn_insurance",
    "displayName": "Monthly NNN Insurance",
    "aliases": [
      "MONTHLY NNN INSURANCE",
      "Monthly NNN Insurance"
    ],
    "description": "Displays the total amount of unallocated NNN (triple net) insurance charges for the tenant as of the end of the period selected. This column is specific to clients with the Entrata Commercial product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "monthly_nnn_taxes",
    "displayName": "Monthly NNN Taxes",
    "aliases": [
      "MONTHLY NNN TAXES",
      "Monthly NNN Taxes"
    ],
    "description": "Displays the total amount of unallocated NNN (triple net) tax charges for the tenant as of the end of the period selected. This column is specific to clients with the Entrata Commercial product.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "neglected_lead",
    "displayName": "Neglected Lead",
    "aliases": [
      "Neglected Lead"
    ],
    "description": "Displays the number of new leads that did not have a manual contact attempted in the period. New leads that had a first event of call, visit/tour, or chat will not be included in this count because their first event counts as their successful contact, no additional contact attempt is needed. Manual Contact Attempts include events of: Outbound Email, Outgoing SMS, Outgoing Call, Onsite Visits, Unit Tours, and Property Tours. Outbound Emails/SMS will only be counted if they have been manually sent. Email/SMS Messages sent via message center, or automated by the system will not be included in the count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "online_chats",
    "displayName": "Online Chats",
    "aliases": [
      "ONLINE CHATS",
      "Online Chats"
    ],
    "description": "All online chats that are taken during the period selected. Chats that are missed or deleted from the activity log will not be included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 5,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "other_fees",
    "displayName": "Other Fees",
    "aliases": [
      "Other Fees"
    ],
    "description": "The OTHER FEES column will display a total of all other charges, as defined within Unit setup, that are not Security Deposits, Application Fees, or Rent. This column will be disabled by default and can be accessed via the Display Options tab.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "renewal_offer",
    "displayName": "Renewal Offer",
    "aliases": [
      "Renewal Offer"
    ],
    "description": "Displays the rent amount for each term offered. Once a term has been accepted, this column will only show the rent amount for the term accepted by the resident (or property on their behalf). This column will be affected by the Charge Usage filter which limits the value to certain charge usages.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 4,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "return_visits_tours",
    "displayName": "Return Visits/Tours",
    "aliases": [
      "Return Visits/Tours"
    ],
    "description": "Counts the number of onsite visits, property tours, or unit tours listed on the activity log that are return visits. This column excludes the initial visit/tour. Events that are deleted from the activity log will not be included. Events with a missed, cancelled, or reschduled event are not included.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_charges_avg",
    "displayName": "Scheduled Charges (Avg)",
    "aliases": [
      "Scheduled Charges (Avg)"
    ],
    "description": "Displays the average Scheduled Charges of occupied units. Scheduled Charges is the monthly (non-prorated) amount of all scheduled recurring charges on the lease in the period selected based on the charge codes selected in the Charge Codes filter. No scheduled charges are displayed for units vacant at the end of the period selected. If a resident transfers units within the period and new lease charges have not started yet, then old lease charges will be carried over.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "scheduled_rent_avg",
    "displayName": "Scheduled Rent (Avg)",
    "aliases": [
      "Scheduled Rent (Avg)"
    ],
    "description": "Displays the average Scheduled Rent of occupied units. Scheduled Rent is the monthly (non-prorated) amount of Rent-type scheduled recurring charges and credits on the lease in the period selected based on the charges codes selected in the Charge Codes filter. No scheduled charges are displayed for units vacant at the end of the period selected. If a resident transfers units within the period and new lease charges have not started yet, then old lease charges will be carried over.",
    "fieldKind": "metric",
    "dataType": "currency",
    "primaryTopic": "financial",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 20,
    "distinctDescriptions": 2,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "bathrooms",
    "displayName": "Bathrooms",
    "aliases": [
      "Bathrooms"
    ],
    "description": "Displays the number of bathrooms in the unit. Units are managed under Setup >> Properties >> [Select Property] >> Floor Plans & Units >> Units >> [Select Unit].",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 14,
    "distinctDescriptions": 3,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  },
  {
    "key": "application_denied",
    "displayName": "Application - Denied",
    "aliases": [
      "Application - Denied"
    ],
    "description": "When an application is completed and cancelled with a denial reason it is considered denied. Applications that are denied will not be included in the Completed (Cancelled) column. In the case that an application is approved in error, reverted, rescreened, and denied, the application will be considered in the Application Approved (Cancelled) column in order to keep an accurate net count.",
    "fieldKind": "metric",
    "dataType": "integer",
    "primaryTopic": "quantity",
    "cursorPriority": "core",
    "confidence": "medium",
    "ambiguity": "low",
    "usageCount": 4,
    "distinctDescriptions": 1,
    "sourceDatabases": [
      "reports"
    ],
    "notes": ""
  }
] as const;
