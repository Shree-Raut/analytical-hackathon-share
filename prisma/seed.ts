import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

// ─── HELPERS ───────────────────────────────────────────────────────────────

function cuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}

function yearsAgo(min: number, max: number): Date {
  const years = min + Math.random() * (max - min);
  return new Date(Date.now() - years * 365.25 * 86400000);
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function period(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── IDS ───────────────────────────────────────────────────────────────────

const ids = {
  greystar: cuid(),
  trinity: cuid(),
  boutique: cuid(),

  entityGreystarSE: cuid(),
  entityGreystarWC: cuid(),
  entityGreystarStudent: cuid(),
  entityTrinityCore: cuid(),
  entityTrinityVA: cuid(),
  entityBoutiqueUrban: cuid(),

  // Properties — Greystar
  meridian: cuid(),
  harborPoint: cuid(),
  libertySquare: cuid(),
  cascadeRidge: cuid(),
  heritageOaks: cuid(),
  campusView: cuid(),
  skylineTower: cuid(),
  riversideCommons: cuid(),
  parksideVillage: cuid(),
  theSummit: cuid(),
  magnoliaStation: cuid(),
  beaconHill: cuid(),

  // Properties — Trinity
  copperCreek: cuid(),
  valleyVista: cuid(),
  trinityHeights: cuid(),
  pacificGardens: cuid(),
  lakewoodCommons: cuid(),

  // Properties — Boutique
  theLinden: cuid(),
  elmAndMain: cuid(),
  theWhitmore: cuid(),

  // Data sources
  dsEntrata: cuid(),
  dsYardi: cuid(),
  dsSalesforce: cuid(),

  // Report templates
  tplNoiWaterfall: cuid(),
  tplPortfolioSnapshot: cuid(),
  tplDelinquencyAging: cuid(),
  tplLeasingFunnel: cuid(),
  tplAiPerformance: cuid(),
  tplRentRoll: cuid(),
  tplTraffic: cuid(),
  tplBudgetVariance: cuid(),
  tplDailyOps: cuid(),
  tplMaintenanceScorecard: cuid(),
  tplOwnerPackage: cuid(),
  tplRenewalForecast: cuid(),
  tplTrailing12: cuid(),
  tplResidentSatisfaction: cuid(),
  tplFlywheel: cuid(),
};

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────

const customers = [
  { id: ids.greystar, name: "Greystar Real Estate", slug: "greystar", portfolioSize: 50000, tier: "ENTERPRISE", fiscalYearStart: 1 },
  { id: ids.trinity, name: "Trinity Property Consultants", slug: "trinity", portfolioSize: 14000, tier: "ENTERPRISE", fiscalYearStart: 10 },
  { id: ids.boutique, name: "Boutique Living", slug: "boutique", portfolioSize: 500, tier: "GROWTH", fiscalYearStart: 1 },
];

// ─── OWNERSHIP ENTITIES ────────────────────────────────────────────────────

const ownershipEntities = [
  { id: ids.entityGreystarSE, customerId: ids.greystar, name: "Greystar Southeast Fund", fiscalYearStart: 1 },
  { id: ids.entityGreystarWC, customerId: ids.greystar, name: "Greystar West Coast Fund", fiscalYearStart: 1 },
  { id: ids.entityGreystarStudent, customerId: ids.greystar, name: "Greystar Student Portfolio", fiscalYearStart: 1 },
  { id: ids.entityTrinityCore, customerId: ids.trinity, name: "Trinity Core Fund", fiscalYearStart: 10 },
  { id: ids.entityTrinityVA, customerId: ids.trinity, name: "Trinity Value-Add Fund", fiscalYearStart: 10 },
  { id: ids.entityBoutiqueUrban, customerId: ids.boutique, name: "Boutique Urban Collection", fiscalYearStart: 1 },
];

// ─── PROPERTIES ────────────────────────────────────────────────────────────

interface PropertySeed {
  id: string;
  name: string;
  customerId: string;
  entityId: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  unitCount: number;
  classType: string;
  vertical: string;
}

const propertySeedData: PropertySeed[] = [
  // Greystar — Southeast Fund
  { id: ids.meridian, name: "The Meridian", customerId: ids.greystar, entityId: ids.entityGreystarSE, city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903, unitCount: 312, classType: "Class A", vertical: "Market Rate" },
  { id: ids.libertySquare, name: "Liberty Square", customerId: ids.greystar, entityId: ids.entityGreystarSE, city: "Atlanta", state: "GA", lat: 33.749, lng: -84.388, unitCount: 186, classType: "Class B", vertical: "Market Rate" },
  { id: ids.heritageOaks, name: "Heritage Oaks", customerId: ids.greystar, entityId: ids.entityGreystarSE, city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431, unitCount: 220, classType: "Class B", vertical: "Market Rate" },
  { id: ids.riversideCommons, name: "Riverside Commons", customerId: ids.greystar, entityId: ids.entityGreystarSE, city: "Nashville", state: "TN", lat: 36.1627, lng: -86.7816, unitCount: 280, classType: "Class A", vertical: "Market Rate" },
  { id: ids.magnoliaStation, name: "Magnolia Station", customerId: ids.greystar, entityId: ids.entityGreystarSE, city: "Charlotte", state: "NC", lat: 35.2271, lng: -80.8431, unitCount: 264, classType: "Class B", vertical: "Market Rate" },

  // Greystar — West Coast Fund
  { id: ids.harborPoint, name: "Harbor Point", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321, unitCount: 248, classType: "Class A", vertical: "Market Rate" },
  { id: ids.cascadeRidge, name: "Cascade Ridge", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Portland", state: "OR", lat: 45.5152, lng: -122.6784, unitCount: 164, classType: "Class B", vertical: "Market Rate" },
  { id: ids.skylineTower, name: "Skyline Tower", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298, unitCount: 156, classType: "Class A", vertical: "Market Rate" },
  { id: ids.parksideVillage, name: "Parkside Village", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.074, unitCount: 340, classType: "Class B", vertical: "Market Rate" },
  { id: ids.theSummit, name: "The Summit", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Salt Lake City", state: "UT", lat: 40.7608, lng: -111.891, unitCount: 196, classType: "Class A", vertical: "Market Rate" },
  { id: ids.beaconHill, name: "Beacon Hill", customerId: ids.greystar, entityId: ids.entityGreystarWC, city: "Boston", state: "MA", lat: 42.3601, lng: -71.0589, unitCount: 128, classType: "Class A", vertical: "Market Rate" },

  // Greystar — Student Portfolio
  { id: ids.campusView, name: "Campus View", customerId: ids.greystar, entityId: ids.entityGreystarStudent, city: "Provo", state: "UT", lat: 40.2338, lng: -111.6585, unitCount: 480, classType: "Class B", vertical: "Student" },

  // Trinity — Core Fund
  { id: ids.copperCreek, name: "Copper Creek", customerId: ids.trinity, entityId: ids.entityTrinityCore, city: "Scottsdale", state: "AZ", lat: 33.4942, lng: -111.9261, unitCount: 198, classType: "Class A", vertical: "Senior" },
  { id: ids.pacificGardens, name: "Pacific Gardens", customerId: ids.trinity, entityId: ids.entityTrinityCore, city: "San Diego", state: "CA", lat: 32.7157, lng: -117.1611, unitCount: 180, classType: "Class A", vertical: "Market Rate" },
  { id: ids.lakewoodCommons, name: "Lakewood Commons", customerId: ids.trinity, entityId: ids.entityTrinityCore, city: "Denver", state: "CO", lat: 39.7294, lng: -105.0843, unitCount: 275, classType: "Class B", vertical: "Market Rate" },

  // Trinity — Value-Add Fund
  { id: ids.valleyVista, name: "Valley Vista", customerId: ids.trinity, entityId: ids.entityTrinityVA, city: "San Antonio", state: "TX", lat: 29.4241, lng: -98.4936, unitCount: 420, classType: "Class C", vertical: "Affordable" },
  { id: ids.trinityHeights, name: "Trinity Heights", customerId: ids.trinity, entityId: ids.entityTrinityVA, city: "Dallas", state: "TX", lat: 32.7767, lng: -96.797, unitCount: 340, classType: "Class B", vertical: "Market Rate" },

  // Boutique — Urban Collection
  { id: ids.theLinden, name: "The Linden", customerId: ids.boutique, entityId: ids.entityBoutiqueUrban, city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431, unitCount: 42, classType: "Class A", vertical: "Market Rate" },
  { id: ids.elmAndMain, name: "Elm & Main", customerId: ids.boutique, entityId: ids.entityBoutiqueUrban, city: "Nashville", state: "TN", lat: 36.1627, lng: -86.7816, unitCount: 36, classType: "Class A", vertical: "Market Rate" },
  { id: ids.theWhitmore, name: "The Whitmore", customerId: ids.boutique, entityId: ids.entityBoutiqueUrban, city: "Charlotte", state: "NC", lat: 35.2271, lng: -80.8431, unitCount: 28, classType: "Class A", vertical: "Market Rate" },
];

function buildProperties() {
  return propertySeedData.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slug(p.name),
    customerId: p.customerId,
    entityId: p.entityId,
    address: `${randomInt(100, 9999)} ${["Main St", "Park Ave", "Oak Blvd", "Elm Dr", "Market St", "Broadway", "Lakeview Dr"][randomInt(0, 6)]}`,
    city: p.city,
    state: p.state,
    lat: p.lat,
    lng: p.lng,
    classType: p.classType,
    vertical: p.vertical,
    vintage: randomInt(1985, 2023),
    unitCount: p.unitCount,
    managedSince: yearsAgo(1, 8),
  }));
}

// ─── METRIC DEFINITIONS ────────────────────────────────────────────────────

interface MetricSeed {
  slug: string;
  name: string;
  description: string;
  formula: string;
  format: string;
  category: string;
  sourceSystem: string;
  sortOrder: number;
}

const metricSeeds: MetricSeed[] = [
  // Revenue (8)
  { slug: "gross_potential_rent", name: "Gross Potential Rent", description: "Maximum rental income if all units leased at market rate with zero loss", formula: "SUM(unit_market_rent)", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 1 },
  { slug: "net_rental_income", name: "Net Rental Income", description: "Actual rental revenue collected after all adjustments", formula: "gross_potential_rent - vacancy_loss - loss_to_lease - concessions - bad_debt", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 2 },
  { slug: "loss_to_lease", name: "Loss to Lease", description: "Revenue gap between market rent and actual lease rates", formula: "SUM(unit_market_rent - unit_actual_rent) WHERE occupied", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 3 },
  { slug: "vacancy_loss", name: "Vacancy Loss", description: "Revenue lost from unoccupied units", formula: "SUM(unit_market_rent) WHERE vacant * days_vacant / days_in_period", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 4 },
  { slug: "concessions", name: "Concessions", description: "Revenue reductions offered as move-in or renewal incentives", formula: "SUM(concession_amount)", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 5 },
  { slug: "bad_debt", name: "Bad Debt", description: "Uncollectable resident balances written off", formula: "SUM(write_off_amount)", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 6 },
  { slug: "other_income", name: "Other Income", description: "Non-rental revenue including fees, parking, and amenities", formula: "SUM(fee_income + parking_income + amenity_income + late_fees)", format: "currency", category: "revenue", sourceSystem: "pms", sortOrder: 7 },
  { slug: "effective_gross_income", name: "Effective Gross Income", description: "Total property revenue after all adjustments", formula: "net_rental_income + other_income", format: "currency", category: "revenue", sourceSystem: "derived", sortOrder: 8 },

  // Expense (9)
  { slug: "total_operating_expense", name: "Total Operating Expense", description: "All property operating costs excluding capital expenditures", formula: "controllable_expense + non_controllable_expense", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 10 },
  { slug: "controllable_expense", name: "Controllable Expense", description: "Operating costs within management's direct control", formula: "payroll + repairs_maintenance + utilities + management_fee + marketing + admin", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 11 },
  { slug: "non_controllable_expense", name: "Non-Controllable Expense", description: "Fixed costs not directly manageable such as taxes and insurance", formula: "insurance + taxes", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 12 },
  { slug: "payroll", name: "Payroll", description: "Total on-site staff compensation and benefits", formula: "SUM(employee_cost) WHERE property", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 13 },
  { slug: "repairs_maintenance", name: "Repairs & Maintenance", description: "Routine and preventive maintenance costs", formula: "SUM(work_order_cost) WHERE type IN ('repair','preventive')", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 14 },
  { slug: "utilities", name: "Utilities", description: "Water, electric, gas, trash, and common-area utility costs", formula: "SUM(utility_charges)", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 15 },
  { slug: "insurance", name: "Insurance", description: "Property and liability insurance premiums", formula: "SUM(insurance_premium)", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 16 },
  { slug: "taxes", name: "Real Estate Taxes", description: "Property tax obligations", formula: "SUM(tax_assessment)", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 17 },
  { slug: "management_fee", name: "Management Fee", description: "Fee charged by property management company", formula: "effective_gross_income * management_fee_rate", format: "currency", category: "expense", sourceSystem: "pms", sortOrder: 18 },

  // Leasing (13)
  { slug: "occupancy_rate", name: "Occupancy Rate", description: "Percentage of units currently leased and occupied", formula: "occupied_units / total_units * 100", format: "percent", category: "leasing", sourceSystem: "pms", sortOrder: 20 },
  { slug: "vacancy_rate", name: "Vacancy Rate", description: "Percentage of units currently unleased", formula: "100 - occupancy_rate", format: "percent", category: "leasing", sourceSystem: "derived", sortOrder: 21 },
  { slug: "leasing_velocity", name: "Leasing Velocity", description: "Number of new leases signed per period", formula: "COUNT(leases) WHERE signed_date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 22 },
  { slug: "avg_days_to_lease", name: "Avg Days to Lease", description: "Average time from unit availability to executed lease", formula: "AVG(lease_signed_date - unit_available_date)", format: "days", category: "leasing", sourceSystem: "pms", sortOrder: 23 },
  { slug: "lead_to_lease_conversion", name: "Lead-to-Lease Conversion", description: "Percentage of leads that convert to signed leases", formula: "leases_signed / lead_volume * 100", format: "percent", category: "leasing", sourceSystem: "pms", sortOrder: 24 },
  { slug: "lead_volume", name: "Lead Volume", description: "Total prospect inquiries received", formula: "COUNT(leads) WHERE created_date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 25 },
  { slug: "tours_scheduled", name: "Tours Scheduled", description: "Number of property tours booked", formula: "COUNT(tours) WHERE scheduled_date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 26 },
  { slug: "applications_received", name: "Applications Received", description: "Rental applications submitted by prospects", formula: "COUNT(applications) WHERE submitted_date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 27 },
  { slug: "leases_signed", name: "Leases Signed", description: "New lease agreements executed", formula: "COUNT(leases) WHERE signed_date IN period AND type = 'new'", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 28 },
  { slug: "move_ins", name: "Move-Ins", description: "Residents who moved in during the period", formula: "COUNT(move_ins) WHERE date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 29 },
  { slug: "move_outs", name: "Move-Outs", description: "Residents who vacated during the period", formula: "COUNT(move_outs) WHERE date IN period", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 30 },
  { slug: "renewal_rate", name: "Renewal Rate", description: "Percentage of expiring leases that renew", formula: "renewals / expiring_leases * 100", format: "percent", category: "leasing", sourceSystem: "pms", sortOrder: 31 },
  { slug: "avg_lease_term", name: "Avg Lease Term", description: "Average duration of executed leases in months", formula: "AVG(lease_end - lease_start) IN months", format: "number", category: "leasing", sourceSystem: "pms", sortOrder: 32 },

  // Maintenance (7)
  { slug: "work_orders_open", name: "Work Orders Open", description: "Active unresolved maintenance requests", formula: "COUNT(work_orders) WHERE status IN ('open','in_progress')", format: "number", category: "maintenance", sourceSystem: "pms", sortOrder: 40 },
  { slug: "work_orders_completed", name: "Work Orders Completed", description: "Maintenance requests resolved during the period", formula: "COUNT(work_orders) WHERE completed_date IN period", format: "number", category: "maintenance", sourceSystem: "pms", sortOrder: 41 },
  { slug: "avg_resolution_time", name: "Avg Resolution Time", description: "Mean time from work order creation to completion in days", formula: "AVG(completed_date - created_date) IN days", format: "days", category: "maintenance", sourceSystem: "pms", sortOrder: 42 },
  { slug: "emergency_requests", name: "Emergency Requests", description: "Urgent maintenance requests requiring immediate response", formula: "COUNT(work_orders) WHERE priority = 'emergency' AND created_date IN period", format: "number", category: "maintenance", sourceSystem: "pms", sortOrder: 43 },
  { slug: "preventive_maintenance_ratio", name: "Preventive Maintenance Ratio", description: "Proportion of maintenance that is proactive vs reactive", formula: "preventive_work_orders / total_work_orders * 100", format: "percent", category: "maintenance", sourceSystem: "pms", sortOrder: 44 },
  { slug: "turn_time", name: "Unit Turn Time", description: "Average days to make a vacated unit rent-ready", formula: "AVG(ready_date - vacate_date) IN days", format: "days", category: "maintenance", sourceSystem: "pms", sortOrder: 45 },
  { slug: "make_ready_cost", name: "Make-Ready Cost", description: "Average cost to prepare a unit for new resident", formula: "AVG(turn_cost)", format: "currency", category: "maintenance", sourceSystem: "pms", sortOrder: 46 },

  // Financial (9)
  { slug: "noi", name: "Net Operating Income", description: "Revenue remaining after all operating expenses", formula: "effective_gross_income - total_operating_expense", format: "currency", category: "financial", sourceSystem: "derived", sortOrder: 50 },
  { slug: "noi_margin", name: "NOI Margin", description: "NOI as a percentage of effective gross income", formula: "noi / effective_gross_income * 100", format: "percent", category: "financial", sourceSystem: "derived", sortOrder: 51 },
  { slug: "collections_rate", name: "Collections Rate", description: "Percentage of billed charges successfully collected", formula: "payments_received / charges_billed * 100", format: "percent", category: "financial", sourceSystem: "pms", sortOrder: 52 },
  { slug: "delinquency_rate", name: "Delinquency Rate", description: "Percentage of residents with balances past due", formula: "delinquent_units / occupied_units * 100", format: "percent", category: "financial", sourceSystem: "pms", sortOrder: 53 },
  { slug: "delinquency_amount", name: "Delinquency Amount", description: "Total dollar amount past due across all residents", formula: "SUM(balance) WHERE days_past_due > 0", format: "currency", category: "financial", sourceSystem: "pms", sortOrder: 54 },
  { slug: "expense_ratio", name: "Expense Ratio", description: "Operating expenses as a percentage of revenue", formula: "total_operating_expense / effective_gross_income * 100", format: "percent", category: "financial", sourceSystem: "derived", sortOrder: 55 },
  { slug: "revenue_per_unit", name: "Revenue Per Unit", description: "Average monthly revenue generated per unit", formula: "effective_gross_income / total_units", format: "currency", category: "financial", sourceSystem: "derived", sortOrder: 56 },
  { slug: "expense_per_unit", name: "Expense Per Unit", description: "Average monthly operating cost per unit", formula: "total_operating_expense / total_units", format: "currency", category: "financial", sourceSystem: "derived", sortOrder: 57 },
  { slug: "capex_per_unit", name: "CapEx Per Unit", description: "Capital expenditure allocated per unit annually", formula: "total_capex / total_units", format: "currency", category: "financial", sourceSystem: "pms", sortOrder: 58 },

  // Resident (6)
  { slug: "satisfaction_score", name: "Resident Satisfaction Score", description: "Average satisfaction rating from resident surveys (1-10)", formula: "AVG(survey_score)", format: "number", category: "resident", sourceSystem: "homebody", sortOrder: 60 },
  { slug: "app_engagement", name: "App Engagement Rate", description: "Percentage of residents actively using the resident app monthly", formula: "active_app_users / total_residents * 100", format: "percent", category: "resident", sourceSystem: "homebody", sortOrder: 61 },
  { slug: "service_attach_rate", name: "Service Attach Rate", description: "Percentage of residents subscribed to at least one ancillary service", formula: "residents_with_services / total_residents * 100", format: "percent", category: "resident", sourceSystem: "homebody", sortOrder: 62 },
  { slug: "online_payment_rate", name: "Online Payment Rate", description: "Percentage of rent payments made through digital channels", formula: "online_payments / total_payments * 100", format: "percent", category: "resident", sourceSystem: "pms", sortOrder: 63 },
  { slug: "renewal_acceptance_rate", name: "Renewal Acceptance Rate", description: "Percentage of renewal offers accepted by residents", formula: "accepted_renewals / offered_renewals * 100", format: "percent", category: "resident", sourceSystem: "pms", sortOrder: 64 },
  { slug: "avg_resident_tenure", name: "Avg Resident Tenure", description: "Average length of residency in months", formula: "AVG(current_date - move_in_date) IN months", format: "number", category: "resident", sourceSystem: "pms", sortOrder: 65 },

  // AI (7)
  { slug: "ai_conversations", name: "AI Conversations", description: "Total AI-handled interactions with prospects and residents", formula: "COUNT(ai_sessions) WHERE period", format: "number", category: "ai", sourceSystem: "oxp", sortOrder: 70 },
  { slug: "ai_response_time", name: "AI Avg Response Time", description: "Mean time for AI to generate a response in seconds", formula: "AVG(response_time_ms) / 1000", format: "number", category: "ai", sourceSystem: "oxp", sortOrder: 71 },
  { slug: "ai_resolution_rate", name: "AI Resolution Rate", description: "Percentage of AI conversations resolved without human handoff", formula: "resolved_conversations / total_conversations * 100", format: "percent", category: "ai", sourceSystem: "oxp", sortOrder: 72 },
  { slug: "ai_escalation_rate", name: "AI Escalation Rate", description: "Percentage of AI conversations requiring human intervention", formula: "escalated_conversations / total_conversations * 100", format: "percent", category: "ai", sourceSystem: "oxp", sortOrder: 73 },
  { slug: "ai_hours_saved", name: "AI Hours Saved", description: "Estimated staff hours displaced by AI automation", formula: "SUM(task_duration_estimate) WHERE handled_by = 'ai'", format: "number", category: "ai", sourceSystem: "oxp", sortOrder: 74 },
  { slug: "ai_cost_savings", name: "AI Cost Savings", description: "Dollar value of labor costs avoided through AI", formula: "ai_hours_saved * blended_hourly_rate", format: "currency", category: "ai", sourceSystem: "derived", sortOrder: 75 },
  { slug: "ai_leasing_conversion", name: "AI Leasing Conversion", description: "Lead-to-lease conversion rate for AI-handled prospects", formula: "ai_leases / ai_leads * 100", format: "percent", category: "ai", sourceSystem: "oxp", sortOrder: 76 },
];

function buildMetricDefinitions() {
  return metricSeeds.map((m) => ({
    id: cuid(),
    name: m.name,
    slug: m.slug,
    description: m.description,
    formula: m.formula,
    format: m.format,
    category: m.category,
    sourceSystem: m.sourceSystem,
    certificationTier: "CANONICAL",
    isActive: true,
    sortOrder: m.sortOrder,
    dimensions: JSON.stringify(["property", "period", "entity"]),
  }));
}

// ─── REPORT TEMPLATES ──────────────────────────────────────────────────────

function buildReportTemplates() {
  return [
    { id: ids.tplNoiWaterfall, name: "NOI Waterfall", slug: "noi-waterfall", description: "Visualizes revenue-to-NOI flow with drill-down by property and period", category: "finance", templateType: "waterfall", metricRefs: JSON.stringify(["gross_potential_rent", "vacancy_loss", "loss_to_lease", "concessions", "bad_debt", "other_income", "total_operating_expense", "noi"]), isActive: true, sortOrder: 1 },
    { id: ids.tplPortfolioSnapshot, name: "Portfolio Snapshot", slug: "portfolio-snapshot", description: "At-a-glance view of portfolio health across occupancy, revenue, and NOI", category: "operations", templateType: "dashboard", metricRefs: JSON.stringify(["occupancy_rate", "noi", "noi_margin", "collections_rate", "delinquency_rate", "revenue_per_unit"]), isActive: true, sortOrder: 2 },
    { id: ids.tplDelinquencyAging, name: "Delinquency Aging", slug: "delinquency-aging", description: "Breaks down past-due balances by aging bucket (0-30, 31-60, 61-90, 90+)", category: "finance", templateType: "table", metricRefs: JSON.stringify(["delinquency_rate", "delinquency_amount", "collections_rate"]), isActive: true, sortOrder: 3 },
    { id: ids.tplLeasingFunnel, name: "Leasing Funnel", slug: "leasing-funnel", description: "Tracks leads through the full leasing lifecycle from inquiry to move-in", category: "leasing", templateType: "funnel", metricRefs: JSON.stringify(["lead_volume", "tours_scheduled", "applications_received", "leases_signed", "move_ins", "lead_to_lease_conversion"]), isActive: true, sortOrder: 4 },
    { id: ids.tplAiPerformance, name: "AI Performance", slug: "ai-performance", description: "Measures ELI+ AI impact across conversations, resolution, and cost savings", category: "ai", templateType: "dashboard", metricRefs: JSON.stringify(["ai_conversations", "ai_resolution_rate", "ai_escalation_rate", "ai_hours_saved", "ai_cost_savings", "ai_leasing_conversion"]), isActive: true, sortOrder: 5 },

    { id: ids.tplRentRoll, name: "Rent Roll", slug: "rent-roll", description: "Detailed unit-level rent roll with lease terms and market comparisons", category: "finance", templateType: "table", isActive: false, sortOrder: 10 },
    { id: ids.tplTraffic, name: "Traffic Report", slug: "traffic-report", description: "Daily and weekly leasing traffic with source attribution", category: "leasing", templateType: "table", isActive: false, sortOrder: 11 },
    { id: ids.tplBudgetVariance, name: "Budget Variance", slug: "budget-variance", description: "Actual vs budget comparison across all GL categories", category: "finance", templateType: "table", isActive: false, sortOrder: 12 },
    { id: ids.tplDailyOps, name: "Daily Operations", slug: "daily-operations", description: "Morning report with overnight activity, delinquency, and occupancy", category: "operations", templateType: "dashboard", isActive: false, sortOrder: 13 },
    { id: ids.tplMaintenanceScorecard, name: "Maintenance Scorecard", slug: "maintenance-scorecard", description: "Work order throughput, turn times, and cost tracking", category: "operations", templateType: "dashboard", isActive: false, sortOrder: 14 },
    { id: ids.tplOwnerPackage, name: "Owner Package", slug: "owner-package", description: "Institutional-grade monthly owner reporting package", category: "finance", templateType: "report", isActive: false, sortOrder: 15 },
    { id: ids.tplRenewalForecast, name: "Renewal Forecast", slug: "renewal-forecast", description: "Projects upcoming lease expirations and expected renewal outcomes", category: "leasing", templateType: "table", isActive: false, sortOrder: 16 },
    { id: ids.tplTrailing12, name: "Trailing 12", slug: "trailing-12", description: "Rolling 12-month financial performance trend", category: "finance", templateType: "chart", isActive: false, sortOrder: 17 },
    { id: ids.tplResidentSatisfaction, name: "Resident Satisfaction", slug: "resident-satisfaction", description: "Aggregated survey results, NPS, and engagement metrics", category: "operations", templateType: "dashboard", isActive: false, sortOrder: 18 },
    { id: ids.tplFlywheel, name: "Flywheel Dashboard", slug: "flywheel-dashboard", description: "Shows compounding AI value across the Entrata platform flywheel", category: "ai", templateType: "dashboard", isActive: false, sortOrder: 19 },
  ].map((t) => ({
    ...t,
    metricRefs: t.metricRefs ?? JSON.stringify([]),
    defaultFilters: JSON.stringify({}),
    layoutConfig: JSON.stringify({}),
  }));
}

// ─── CUSTOMER REPORTS ──────────────────────────────────────────────────────

function buildCustomerReports(greystarId: string) {
  const activeTemplates = [ids.tplNoiWaterfall, ids.tplPortfolioSnapshot, ids.tplDelinquencyAging, ids.tplLeasingFunnel, ids.tplAiPerformance];

  const reports: Array<{
    id: string; customerId: string; templateId: string; name: string;
    tier: string; filters: string; ownerId?: string; teamId?: string; notes?: string;
  }> = [];

  // 3 PERSONAL
  const personalNames = ["My NOI Dashboard", "Denver Properties Watch", "AI Weekly Check"];
  for (let i = 0; i < 3; i++) {
    reports.push({
      id: cuid(), customerId: greystarId, templateId: activeTemplates[i % 5],
      name: personalNames[i], tier: "PERSONAL", ownerId: "user_jsmith",
      filters: JSON.stringify({ dateRange: "last_3_months", properties: i === 1 ? ["meridian", "lakewood-commons"] : [] }),
    });
  }

  // 5 TEAM
  const teamNames = ["Ops Team - Portfolio View", "Leasing Team Funnel", "Southeast Fund NOI", "West Coast Delinquency", "Student Housing AI Metrics"];
  for (let i = 0; i < 5; i++) {
    reports.push({
      id: cuid(), customerId: greystarId, templateId: activeTemplates[i % 5],
      name: teamNames[i], tier: "TEAM", teamId: ["ops", "leasing", "ops", "finance", "ai"][i],
      filters: JSON.stringify({ dateRange: "last_6_months", entity: i < 3 ? "southeast" : undefined }),
    });
  }

  // 4 PUBLISHED
  const publishedNames = ["Monthly Executive Summary", "Investor NOI Report", "Delinquency Dashboard (All Properties)", "AI Impact Report - Q4"];
  for (let i = 0; i < 4; i++) {
    reports.push({
      id: cuid(), customerId: greystarId, templateId: activeTemplates[i % 5],
      name: publishedNames[i], tier: "PUBLISHED",
      filters: JSON.stringify({ dateRange: i === 3 ? "2025-Q4" : "last_12_months" }),
      notes: "Published for all portfolio managers",
    });
  }

  // 3 CERTIFIED
  const certifiedNames = ["Board Reporting Package", "Certified NOI - Annual", "Certified Occupancy Trends"];
  for (let i = 0; i < 3; i++) {
    reports.push({
      id: cuid(), customerId: greystarId, templateId: activeTemplates[i % 5],
      name: certifiedNames[i], tier: "CERTIFIED",
      filters: JSON.stringify({ dateRange: "last_12_months", certified: true }),
      notes: "Approved by VP Finance — locked for audit",
    });
  }

  return reports;
}

// ─── ALERT RULES & ALERTS ──────────────────────────────────────────────────

function buildAlertRules(greystarId: string, metricMap: Map<string, string>) {
  return [
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("occupancy_rate")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "lt", value: 92, windowDays: 7 }),
      channels: JSON.stringify(["IN_APP", "EMAIL"]), isActive: true,
    },
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("delinquency_rate")!,
      alertType: "THRESHOLD", severity: "CRITICAL",
      config: JSON.stringify({ operator: "gt", value: 5, windowDays: 1 }),
      channels: JSON.stringify(["IN_APP", "EMAIL", "SMS"]), isActive: true,
    },
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("collections_rate")!,
      alertType: "VARIANCE", severity: "WARNING",
      config: JSON.stringify({ comparisonPeriod: "prior_month", variancePercent: -3 }),
      channels: JSON.stringify(["IN_APP"]), isActive: true,
    },
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("work_orders_open")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "gt", value: 25, windowDays: 3 }),
      channels: JSON.stringify(["IN_APP"]), isActive: true,
    },
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("noi")!,
      alertType: "VARIANCE", severity: "CRITICAL",
      config: JSON.stringify({ comparisonPeriod: "budget", variancePercent: -10 }),
      channels: JSON.stringify(["IN_APP", "EMAIL"]), isActive: true,
    },
    {
      id: cuid(), customerId: greystarId, metricId: metricMap.get("renewal_rate")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "lt", value: 55, windowDays: 30 }),
      channels: JSON.stringify(["IN_APP"]), isActive: true,
    },
  ];
}

function buildAlerts(alertRules: Array<{ id: string; metricId: string; alertType: string; severity: string }>) {
  const delinquencyRule = alertRules[1];
  const occupancyRule = alertRules[0];
  const collectionsRule = alertRules[2];
  const workOrderRule = alertRules[3];
  const noiRule = alertRules[4];

  return [
    // 2 CRITICAL
    {
      id: cuid(), ruleId: delinquencyRule.id, propertyId: ids.libertySquare,
      currentValue: 7.2, thresholdValue: 5.0, severity: "CRITICAL", status: "OPEN",
      triggeredAt: daysAgo(1),
      aiExplanation: "Liberty Square delinquency spiked to 7.2% driven by 8 accounts entering 31-60 day buckets. Three accounts represent 45% of the total delinquent balance. Recommend prioritizing collections outreach to accounts #4821, #4903, and #5012 — combined balance $18,400. Historical pattern suggests late-month recovery, but current trajectory is 2.1% above 6-month average.",
    },
    {
      id: cuid(), ruleId: occupancyRule.id, propertyId: ids.campusView,
      currentValue: 78.0, thresholdValue: 92.0, severity: "CRITICAL", status: "OPEN",
      triggeredAt: daysAgo(3),
      aiExplanation: "Campus View pre-leasing at 78% for fall semester — 14 points below the August target of 92%. Comparable student properties in Provo are averaging 89% pre-leased. Contributing factors: late marketing launch (started 3 weeks after competitors) and 12% higher asking rents than Campus Edge across the street. Recommend authorizing $500 concession on 12-month terms to close the 67-unit gap before classes begin.",
    },

    // 3 WARNING
    {
      id: cuid(), ruleId: collectionsRule.id, propertyId: ids.cascadeRidge,
      currentValue: 93.1, thresholdValue: 96.0, severity: "WARNING", status: "OPEN",
      triggeredAt: daysAgo(5),
    },
    {
      id: cuid(), ruleId: workOrderRule.id, propertyId: ids.parksideVillage,
      currentValue: 28, thresholdValue: 25, severity: "WARNING", status: "ACKNOWLEDGED",
      triggeredAt: daysAgo(7), acknowledgedBy: "maintenance_mgr",
    },
    {
      id: cuid(), ruleId: noiRule.id, propertyId: ids.heritageOaks,
      currentValue: -12.3, thresholdValue: -10.0, severity: "WARNING", status: "OPEN",
      triggeredAt: daysAgo(2),
    },

    // 5 RESOLVED
    ...[ids.meridian, ids.harborPoint, ids.skylineTower, ids.riversideCommons, ids.beaconHill].map((propId, i) => ({
      id: cuid(),
      ruleId: alertRules[i % alertRules.length].id,
      propertyId: propId,
      currentValue: [91.5, 4.8, 94.2, 27, 88000][i],
      thresholdValue: [92, 5, 96, 25, 95000][i],
      severity: "WARNING" as const,
      status: "RESOLVED",
      triggeredAt: daysAgo(randomInt(10, 30)),
      resolvedAt: daysAgo(randomInt(1, 9)),
    })),
  ];
}

// ─── DATA SOURCES ──────────────────────────────────────────────────────────

function buildDataSources(greystarId: string) {
  return [
    {
      id: ids.dsEntrata, customerId: greystarId, name: "Entrata PMS",
      sourceType: "ENTRATA", status: "ACTIVE", syncFrequency: "REALTIME",
      lastSyncAt: new Date(),
    },
    {
      id: ids.dsYardi, customerId: greystarId, name: "Yardi GL Export",
      sourceType: "YARDI_GL", status: "ACTIVE", syncFrequency: "MONTHLY",
      lastSyncAt: daysAgo(5),
    },
    {
      id: ids.dsSalesforce, customerId: greystarId, name: "Salesforce CRM",
      sourceType: "API", status: "ACTIVE", syncFrequency: "DAILY",
      lastSyncAt: daysAgo(1),
    },
  ];
}

// ─── METRIC DATA POINTS ────────────────────────────────────────────────────

function generateMetricDataPoints(
  properties: Array<{ id: string; customerId: string; unitCount: number; name: string }>,
  metricMap: Map<string, string>,
) {
  const points: Array<{
    id: string; metricId: string; propertyId: string; customerId: string;
    period: string; value: number; previousValue: number | null; budgetValue: number | null;
  }> = [];

  const now = new Date();
  const metricsToSeed = [
    "occupancy_rate", "collections_rate", "noi", "delinquency_rate",
    "leasing_velocity", "work_orders_open", "ai_hours_saved",
  ];

  for (const prop of properties) {
    const isLibertySquare = prop.name === "Liberty Square";
    const unitScale = prop.unitCount;

    for (let monthsBack = 23; monthsBack >= 0; monthsBack--) {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const per = period(d);
      const monthIdx = d.getMonth();
      const seasonal = Math.sin((monthIdx - 3) * Math.PI / 6);
      const timeFactor = (24 - monthsBack) / 24;

      for (const metricSlug of metricsToSeed) {
        const metricId = metricMap.get(metricSlug);
        if (!metricId) continue;

        let value: number;
        let budgetValue: number | null = null;
        const noise = (Math.random() - 0.5) * 2;

        switch (metricSlug) {
          case "occupancy_rate": {
            const base = 93 + seasonal * 2 + noise;
            value = isLibertySquare
              ? Math.max(85, base - monthsBack * 0.15 + noise)
              : Math.min(99, Math.max(88, base));
            budgetValue = 95;
            break;
          }
          case "collections_rate": {
            const base = 96 + seasonal * 1.5 + noise * 0.5;
            value = Math.min(99.5, Math.max(92, base));
            budgetValue = 97;
            break;
          }
          case "noi": {
            const revenuePerUnit = 1200 + seasonal * 80 + noise * 30;
            const expensePerUnit = 500 + noise * 15;
            value = Math.round((revenuePerUnit - expensePerUnit) * unitScale);
            budgetValue = Math.round(750 * unitScale);
            break;
          }
          case "delinquency_rate": {
            const base = 3 + seasonal * -0.8 + noise * 0.5;
            value = isLibertySquare
              ? Math.min(9, Math.max(2, base + timeFactor * 4 + noise))
              : Math.max(1, Math.min(8, base));
            budgetValue = 2.5;
            break;
          }
          case "leasing_velocity": {
            const base = 8 + unitScale * 0.03 + seasonal * 3 + noise;
            value = Math.max(2, Math.round(base));
            break;
          }
          case "work_orders_open": {
            const base = unitScale * 0.06 + seasonal * -2 + noise * 2;
            value = Math.max(1, Math.round(base));
            break;
          }
          case "ai_hours_saved": {
            const base = unitScale * 0.8 * timeFactor + seasonal * 10 + noise * 5;
            value = Math.max(10, Math.round(base));
            break;
          }
          default:
            value = 0;
        }

        const prevMonthDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        const prevPer = period(prevMonthDate);
        const prevPoint = points.find(
          (p) => p.propertyId === prop.id && p.metricId === metricId && p.period === prevPer,
        );

        points.push({
          id: cuid(),
          metricId,
          propertyId: prop.id,
          customerId: prop.customerId,
          period: per,
          value: parseFloat(value.toFixed(2)),
          previousValue: prevPoint ? prevPoint.value : null,
          budgetValue,
        });
      }
    }
  }

  return points;
}

// ─── TRINITY SEED DATA ──────────────────────────────────────────────────────

function buildTrinityReports(): Array<{
  id: string; customerId: string; templateId: string; name: string;
  tier: string; filters: string; ownerId?: string; teamId?: string; notes?: string;
}> {
  return [
    // 2 PERSONAL
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplNoiWaterfall, name: "My Income Statement View", tier: "PERSONAL", ownerId: "user_mgarcia", filters: JSON.stringify({ dateRange: "last_6_months" }) },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplRentRoll, name: "Dallas Properties Rent Roll", tier: "PERSONAL", ownerId: "user_mgarcia", filters: JSON.stringify({ dateRange: "current_month", properties: ["trinity-heights"] }) },
    // 4 TEAM
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplPortfolioSnapshot, name: "Core Fund Box Score", tier: "TEAM", teamId: "asset_mgmt", filters: JSON.stringify({ dateRange: "last_3_months", entity: "core" }) },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplDelinquencyAging, name: "Delinquency Watch — All Properties", tier: "TEAM", teamId: "collections", filters: JSON.stringify({ dateRange: "current_month" }) },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplNoiWaterfall, name: "Value-Add Fund P&L", tier: "TEAM", teamId: "asset_mgmt", filters: JSON.stringify({ dateRange: "last_12_months", entity: "value_add" }) },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplLeasingFunnel, name: "Leasing Pipeline — Southwest", tier: "TEAM", teamId: "leasing", filters: JSON.stringify({ dateRange: "last_3_months" }) },
    // 3 PUBLISHED
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplPortfolioSnapshot, name: "Monthly Portfolio Review", tier: "PUBLISHED", filters: JSON.stringify({ dateRange: "last_12_months" }), notes: "Distributed to all regional managers" },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplRentRoll, name: "Rent Roll — Full Portfolio", tier: "PUBLISHED", filters: JSON.stringify({ dateRange: "current_month" }), notes: "Published for ownership review" },
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplDelinquencyAging, name: "Weekly Delinquency Report", tier: "PUBLISHED", filters: JSON.stringify({ dateRange: "last_30_days" }), notes: "Auto-distributed every Monday" },
    // 1 CERTIFIED
    { id: cuid(), customerId: ids.trinity, templateId: ids.tplNoiWaterfall, name: "Certified NOI — Annual Review", tier: "CERTIFIED", filters: JSON.stringify({ dateRange: "last_12_months", certified: true }), notes: "Approved by VP Asset Management — locked" },
  ];
}

function buildTrinityAlertRules(metricMap: Map<string, string>) {
  return [
    {
      id: cuid(), customerId: ids.trinity, metricId: metricMap.get("occupancy_rate")!,
      alertType: "THRESHOLD", severity: "CRITICAL",
      config: JSON.stringify({ operator: "lt", value: 91, windowDays: 7 }),
      channels: JSON.stringify(["IN_APP", "EMAIL", "SMS"]), isActive: true,
    },
    {
      id: cuid(), customerId: ids.trinity, metricId: metricMap.get("delinquency_rate")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "gt", value: 4.5, windowDays: 3 }),
      channels: JSON.stringify(["IN_APP", "EMAIL"]), isActive: true,
    },
    {
      id: cuid(), customerId: ids.trinity, metricId: metricMap.get("work_orders_open")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "gt", value: 20, windowDays: 5 }),
      channels: JSON.stringify(["IN_APP"]), isActive: true,
    },
  ];
}

function buildTrinityAlerts(alertRules: Array<{ id: string; severity: string }>) {
  const [occupancyRule, delinquencyRule, workOrderRule] = alertRules;
  return [
    // 1 CRITICAL — Valley Vista occupancy declining
    {
      id: cuid(), ruleId: occupancyRule.id, propertyId: ids.valleyVista,
      currentValue: 89.2, thresholdValue: 91.0, severity: "CRITICAL", status: "OPEN",
      triggeredAt: daysAgo(2),
      aiExplanation: "Valley Vista occupancy dropped to 89.2%, breaching the 91% threshold. This is the fourth consecutive monthly decline from 93.1% in October. Contributing factors: 18 move-outs in the past 60 days (vs. 11 move-ins) driven by a competing property offering 6-week free rent. Affordable housing waitlist has 23 applicants but income verification is creating a 12-day processing bottleneck. Recommend expediting 8 pending applications and authorizing $200/month concession for immediate move-ins.",
    },
    // 2 WARNING
    {
      id: cuid(), ruleId: delinquencyRule.id, propertyId: ids.copperCreek,
      currentValue: 4.8, thresholdValue: 4.5, severity: "WARNING", status: "OPEN",
      triggeredAt: daysAgo(4),
      aiExplanation: "Copper Creek delinquency at 4.8% — 6 senior residents with past-due balances totaling $14,200. Three accounts are awaiting insurance reimbursement processing. Recommend contacting insurance liaisons for accounts #7201, #7215, and #7230 to expedite payments.",
    },
    {
      id: cuid(), ruleId: workOrderRule.id, propertyId: ids.lakewoodCommons,
      currentValue: 24, thresholdValue: 20, severity: "WARNING", status: "ACKNOWLEDGED",
      triggeredAt: daysAgo(6), acknowledgedBy: "maintenance_dir",
      aiExplanation: "Lakewood Commons has 24 open work orders, 4 above threshold. Backlog driven by HVAC seasonal turnover — 9 of the open orders are heating system inspections. Vendor scheduled for bulk completion this Thursday.",
    },
    // 2 RESOLVED
    {
      id: cuid(), ruleId: delinquencyRule.id, propertyId: ids.trinityHeights,
      currentValue: 3.9, thresholdValue: 4.5, severity: "WARNING", status: "RESOLVED",
      triggeredAt: daysAgo(18), resolvedAt: daysAgo(8),
    },
    {
      id: cuid(), ruleId: occupancyRule.id, propertyId: ids.pacificGardens,
      currentValue: 92.8, thresholdValue: 91.0, severity: "WARNING", status: "RESOLVED",
      triggeredAt: daysAgo(25), resolvedAt: daysAgo(14),
    },
  ];
}

function generateTrinityMetricDataPoints(
  properties: Array<{ id: string; customerId: string; unitCount: number; name: string }>,
  metricMap: Map<string, string>,
) {
  const points: Array<{
    id: string; metricId: string; propertyId: string; customerId: string;
    period: string; value: number; previousValue: number | null; budgetValue: number | null;
  }> = [];

  const now = new Date();
  const metricsToSeed = [
    "occupancy_rate", "collections_rate", "noi", "delinquency_rate",
    "leasing_velocity", "work_orders_open", "ai_hours_saved",
    "renewal_rate", "move_ins", "move_outs", "satisfaction_score", "expense_ratio",
  ];

  for (const prop of properties) {
    const isValleyVista = prop.name === "Valley Vista";
    const isCopperCreek = prop.name === "Copper Creek";
    const unitScale = prop.unitCount;

    for (let monthsBack = 23; monthsBack >= 0; monthsBack--) {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const per = period(d);
      const monthIdx = d.getMonth();
      const seasonal = Math.sin((monthIdx - 3) * Math.PI / 6);
      const timeFactor = (24 - monthsBack) / 24;

      for (const metricSlug of metricsToSeed) {
        const metricId = metricMap.get(metricSlug);
        if (!metricId) continue;

        let value: number;
        let budgetValue: number | null = null;
        const noise = (Math.random() - 0.5) * 2;

        switch (metricSlug) {
          case "occupancy_rate": {
            const base = 91.5 + seasonal * 1.8 + noise;
            value = isValleyVista
              ? Math.max(86, 94.5 - timeFactor * 5.5 + noise * 0.5)
              : isCopperCreek
                ? Math.min(98, Math.max(90, 95.5 + seasonal * 0.8 + noise * 0.3))
                : Math.min(98, Math.max(89, base));
            budgetValue = 93;
            break;
          }
          case "collections_rate": {
            const base = 94.5 + seasonal * 1.2 + noise * 0.4;
            value = isCopperCreek
              ? Math.min(99, Math.max(91, base - 0.8 + noise * 0.3))
              : Math.min(98.5, Math.max(90, base));
            budgetValue = 96;
            break;
          }
          case "noi": {
            const revenuePerUnit = 1050 + seasonal * 60 + noise * 25;
            const expensePerUnit = 480 + noise * 12;
            const noiBase = (revenuePerUnit - expensePerUnit) * unitScale;
            value = isValleyVista
              ? Math.round(noiBase * (0.95 - timeFactor * 0.1))
              : Math.round(noiBase);
            budgetValue = Math.round(620 * unitScale);
            break;
          }
          case "delinquency_rate": {
            const base = 3.5 + seasonal * -0.6 + noise * 0.4;
            value = isValleyVista
              ? Math.max(2, Math.min(8, base + 1.5 + noise * 0.5))
              : isCopperCreek
                ? Math.max(1.5, Math.min(6, base + 0.8 + noise * 0.3))
                : Math.max(1.2, Math.min(7, base));
            budgetValue = 3.0;
            break;
          }
          case "leasing_velocity": {
            const base = 6 + unitScale * 0.025 + seasonal * 2.5 + noise;
            value = Math.max(1, Math.round(base));
            break;
          }
          case "work_orders_open": {
            const base = unitScale * 0.055 + seasonal * -1.5 + noise * 1.5;
            value = Math.max(1, Math.round(base));
            break;
          }
          case "ai_hours_saved": {
            const base = unitScale * 0.6 * timeFactor + seasonal * 8 + noise * 4;
            value = Math.max(5, Math.round(base));
            break;
          }
          case "renewal_rate": {
            const base = 52 + seasonal * 3 + timeFactor * 4 + noise;
            value = isValleyVista
              ? Math.max(38, Math.min(62, base - 6 + noise))
              : Math.max(42, Math.min(72, base));
            budgetValue = 58;
            break;
          }
          case "move_ins": {
            const base = unitScale * 0.03 + seasonal * 2 + noise;
            value = Math.max(1, Math.round(base));
            break;
          }
          case "move_outs": {
            const base = unitScale * 0.025 + seasonal * -1.5 + noise;
            value = isValleyVista
              ? Math.max(2, Math.round(base + unitScale * 0.01 + noise))
              : Math.max(1, Math.round(base));
            break;
          }
          case "satisfaction_score": {
            const base = 7.2 + seasonal * 0.3 + noise * 0.2;
            value = isCopperCreek
              ? Math.min(9.5, Math.max(6.5, base + 0.8))
              : isValleyVista
                ? Math.min(8.5, Math.max(5.5, base - 0.6))
                : Math.min(9.2, Math.max(6.0, base));
            budgetValue = 8.0;
            break;
          }
          case "expense_ratio": {
            const base = 55 + seasonal * -2 + noise;
            value = isValleyVista
              ? Math.min(72, Math.max(48, base + 5 + timeFactor * 3))
              : Math.min(65, Math.max(42, base));
            budgetValue = 50;
            break;
          }
          default:
            value = 0;
        }

        const prevMonthDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        const prevPer = period(prevMonthDate);
        const prevPoint = points.find(
          (p) => p.propertyId === prop.id && p.metricId === metricId && p.period === prevPer,
        );

        points.push({
          id: cuid(),
          metricId,
          propertyId: prop.id,
          customerId: prop.customerId,
          period: per,
          value: parseFloat(value.toFixed(2)),
          previousValue: prevPoint ? prevPoint.value : null,
          budgetValue,
        });
      }
    }
  }

  return points;
}

async function seedTrinityData(metricMap: Map<string, string>) {
  // Clear generic metric data points created by the main seeder for Trinity properties
  await prisma.metricDataPoint.deleteMany({ where: { customerId: ids.trinity } });

  // Data Sources
  const trinityDataSources = [
    {
      id: cuid(), customerId: ids.trinity, name: "Entrata PMS",
      sourceType: "ENTRATA", status: "ACTIVE", syncFrequency: "REALTIME",
      lastSyncAt: new Date(),
    },
    {
      id: cuid(), customerId: ids.trinity, name: "QuickBooks Online",
      sourceType: "API", status: "ACTIVE", syncFrequency: "DAILY",
      lastSyncAt: daysAgo(1),
    },
  ];
  for (const ds of trinityDataSources) {
    await prisma.dataSource.create({ data: ds });
  }
  console.log(`   Created ${trinityDataSources.length} data sources`);

  // Customer Reports (10 total: 2 PERSONAL, 4 TEAM, 3 PUBLISHED, 1 CERTIFIED)
  const trinityReports = buildTrinityReports();
  for (const r of trinityReports) {
    await prisma.customerReport.create({ data: r });
  }
  console.log(`   Created ${trinityReports.length} customer reports`);

  // Customer Metric Override — economic collections
  const trinityOverride = {
    id: cuid(),
    customerId: ids.trinity,
    baseMetricId: metricMap.get("collections_rate")!,
    formula: "(payments_received) / (gross_potential_rent) * 100",
    label: "Economic Collections Rate",
    description: "Measures collections as percentage of gross potential rent rather than charges billed",
    isDefault: true,
    effectiveDate: new Date("2024-06-01"),
    createdBy: "admin@trinitypmc.com",
    approvedBy: "cfo@trinitypmc.com",
  };
  await prisma.customerMetricOverride.create({ data: trinityOverride });
  console.log("   Created 1 metric override");

  // Alert Rules (3)
  const trinityAlertRules = buildTrinityAlertRules(metricMap);
  for (const r of trinityAlertRules) {
    await prisma.alertRule.create({ data: r });
  }
  console.log(`   Created ${trinityAlertRules.length} alert rules`);

  // Alerts (5: 1 CRITICAL, 2 WARNING, 2 RESOLVED)
  const trinityAlerts = buildTrinityAlerts(trinityAlertRules);
  for (const a of trinityAlerts) {
    await prisma.alert.create({ data: a });
  }
  console.log(`   Created ${trinityAlerts.length} alerts (1 critical, 2 warning, 2 resolved)`);

  // Metric Data Points (~1,440: 5 properties x 24 months x 12 metrics)
  console.log("   Generating metric data points...");
  const trinityProperties = [
    { id: ids.trinityHeights, customerId: ids.trinity, unitCount: 340, name: "Trinity Heights" },
    { id: ids.pacificGardens, customerId: ids.trinity, unitCount: 180, name: "Pacific Gardens" },
    { id: ids.lakewoodCommons, customerId: ids.trinity, unitCount: 275, name: "Lakewood Commons" },
    { id: ids.copperCreek, customerId: ids.trinity, unitCount: 198, name: "Copper Creek" },
    { id: ids.valleyVista, customerId: ids.trinity, unitCount: 420, name: "Valley Vista" },
  ];
  const trinityPoints = generateTrinityMetricDataPoints(trinityProperties, metricMap);

  const BATCH_SIZE = 500;
  for (let i = 0; i < trinityPoints.length; i += BATCH_SIZE) {
    const batch = trinityPoints.slice(i, i + BATCH_SIZE);
    await prisma.metricDataPoint.createMany({ data: batch });
    console.log(`   ... ${Math.min(i + BATCH_SIZE, trinityPoints.length)} / ${trinityPoints.length} data points`);
  }
  console.log(`   Created ${trinityPoints.length} metric data points`);

  return {
    dataSources: trinityDataSources.length,
    reports: trinityReports.length,
    overrides: 1,
    alertRules: trinityAlertRules.length,
    alerts: trinityAlerts.length,
    dataPoints: trinityPoints.length,
  };
}

// ─── BOUTIQUE SEED DATA ─────────────────────────────────────────────────────

function buildBoutiqueReports(): Array<{
  id: string; customerId: string; templateId: string; name: string;
  tier: string; filters: string; ownerId?: string; teamId?: string; notes?: string;
}> {
  return [
    // 2 PERSONAL
    { id: cuid(), customerId: ids.boutique, templateId: ids.tplNoiWaterfall, name: "My P&L Dashboard", tier: "PERSONAL", ownerId: "user_acohen", filters: JSON.stringify({ dateRange: "last_3_months" }) },
    { id: cuid(), customerId: ids.boutique, templateId: ids.tplRentRoll, name: "Austin Rent Roll", tier: "PERSONAL", ownerId: "user_acohen", filters: JSON.stringify({ dateRange: "current_month", properties: ["the-linden"] }) },
    // 2 TEAM
    { id: cuid(), customerId: ids.boutique, templateId: ids.tplPortfolioSnapshot, name: "Portfolio Box Score", tier: "TEAM", teamId: "ops", filters: JSON.stringify({ dateRange: "last_6_months" }) },
    { id: cuid(), customerId: ids.boutique, templateId: ids.tplDelinquencyAging, name: "Collections Tracker", tier: "TEAM", teamId: "finance", filters: JSON.stringify({ dateRange: "current_month" }) },
    // 1 PUBLISHED
    { id: cuid(), customerId: ids.boutique, templateId: ids.tplDailyOps, name: "Daily Ops — All Properties", tier: "PUBLISHED", filters: JSON.stringify({ dateRange: "today" }), notes: "Morning briefing for all site managers" },
  ];
}

function buildBoutiqueAlertRules(metricMap: Map<string, string>) {
  return [
    {
      id: cuid(), customerId: ids.boutique, metricId: metricMap.get("delinquency_rate")!,
      alertType: "THRESHOLD", severity: "WARNING",
      config: JSON.stringify({ operator: "gt", value: 3.5, windowDays: 3 }),
      channels: JSON.stringify(["IN_APP", "EMAIL"]), isActive: true,
    },
  ];
}

function buildBoutiqueAlerts(alertRules: Array<{ id: string; severity: string }>) {
  const [delinquencyRule] = alertRules;
  return [
    // 1 WARNING — Elm & Main delinquency
    {
      id: cuid(), ruleId: delinquencyRule.id, propertyId: ids.elmAndMain,
      currentValue: 3.9, thresholdValue: 3.5, severity: "WARNING", status: "OPEN",
      triggeredAt: daysAgo(3),
      aiExplanation: "Elm & Main delinquency at 3.9% — 2 residents past due totaling $6,800. One account ($4,200) is a known late payer who has settled by the 15th in each of the last 4 months. Second account ($2,600) is new and may need direct outreach. Small portfolio magnifies the rate impact of individual accounts.",
    },
    // 1 RESOLVED
    {
      id: cuid(), ruleId: delinquencyRule.id, propertyId: ids.theLinden,
      currentValue: 2.8, thresholdValue: 3.5, severity: "WARNING", status: "RESOLVED",
      triggeredAt: daysAgo(20), resolvedAt: daysAgo(12),
    },
  ];
}

function generateBoutiqueMetricDataPoints(
  properties: Array<{ id: string; customerId: string; unitCount: number; name: string }>,
  metricMap: Map<string, string>,
) {
  const points: Array<{
    id: string; metricId: string; propertyId: string; customerId: string;
    period: string; value: number; previousValue: number | null; budgetValue: number | null;
  }> = [];

  const now = new Date();
  const metricsToSeed = [
    "occupancy_rate", "collections_rate", "noi", "delinquency_rate",
    "leasing_velocity", "work_orders_open", "ai_hours_saved",
  ];

  for (const prop of properties) {
    const unitScale = prop.unitCount;

    for (let monthsBack = 23; monthsBack >= 0; monthsBack--) {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const per = period(d);
      const monthIdx = d.getMonth();
      const seasonal = Math.sin((monthIdx - 3) * Math.PI / 6);
      const timeFactor = (24 - monthsBack) / 24;

      for (const metricSlug of metricsToSeed) {
        const metricId = metricMap.get(metricSlug);
        if (!metricId) continue;

        let value: number;
        let budgetValue: number | null = null;
        const noise = (Math.random() - 0.5) * 2;

        switch (metricSlug) {
          case "occupancy_rate": {
            // Luxury boutique — high demand, tight occupancy
            const base = 95.5 + seasonal * 1.2 + noise * 0.5;
            value = Math.min(100, Math.max(91, base));
            budgetValue = 96;
            break;
          }
          case "collections_rate": {
            // Luxury tenants — reliable payers
            const base = 97.5 + seasonal * 0.8 + noise * 0.3;
            value = Math.min(99.8, Math.max(94, base));
            budgetValue = 98;
            break;
          }
          case "noi": {
            // Higher rents ($2,200-$3,400/unit), lower expense ratio
            const revenuePerUnit = 2800 + seasonal * 120 + noise * 60;
            const expensePerUnit = 1100 + noise * 30;
            value = Math.round((revenuePerUnit - expensePerUnit) * unitScale);
            budgetValue = Math.round(1800 * unitScale);
            break;
          }
          case "delinquency_rate": {
            // Low delinquency in luxury segment
            const base = 1.8 + seasonal * -0.4 + noise * 0.3;
            value = Math.max(0.3, Math.min(4.5, base));
            budgetValue = 1.5;
            break;
          }
          case "leasing_velocity": {
            // Small properties — low volume, steady
            const base = 2 + unitScale * 0.04 + seasonal * 1 + noise * 0.5;
            value = Math.max(0, Math.round(base));
            break;
          }
          case "work_orders_open": {
            // Small buildings — few open orders
            const base = unitScale * 0.07 + seasonal * -0.5 + noise * 0.5;
            value = Math.max(0, Math.round(base));
            break;
          }
          case "ai_hours_saved": {
            // Lower AI adoption but growing
            const base = unitScale * 0.4 * timeFactor + seasonal * 2 + noise * 1.5;
            value = Math.max(1, Math.round(base));
            break;
          }
          default:
            value = 0;
        }

        const prevMonthDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        const prevPer = period(prevMonthDate);
        const prevPoint = points.find(
          (p) => p.propertyId === prop.id && p.metricId === metricId && p.period === prevPer,
        );

        points.push({
          id: cuid(),
          metricId,
          propertyId: prop.id,
          customerId: prop.customerId,
          period: per,
          value: parseFloat(value.toFixed(2)),
          previousValue: prevPoint ? prevPoint.value : null,
          budgetValue,
        });
      }
    }
  }

  return points;
}

async function seedBoutiqueData(metricMap: Map<string, string>) {
  // Clear generic metric data points created by the main seeder for Boutique properties
  await prisma.metricDataPoint.deleteMany({ where: { customerId: ids.boutique } });

  // Data Source (1)
  const boutiqueDataSource = {
    id: cuid(), customerId: ids.boutique, name: "Entrata PMS",
    sourceType: "ENTRATA", status: "ACTIVE", syncFrequency: "REALTIME",
    lastSyncAt: new Date(),
  };
  await prisma.dataSource.create({ data: boutiqueDataSource });
  console.log("   Created 1 data source");

  // Customer Reports (5: 2 PERSONAL, 2 TEAM, 1 PUBLISHED)
  const boutiqueReports = buildBoutiqueReports();
  for (const r of boutiqueReports) {
    await prisma.customerReport.create({ data: r });
  }
  console.log(`   Created ${boutiqueReports.length} customer reports`);

  // Alert Rules (1)
  const boutiqueAlertRules = buildBoutiqueAlertRules(metricMap);
  for (const r of boutiqueAlertRules) {
    await prisma.alertRule.create({ data: r });
  }
  console.log(`   Created ${boutiqueAlertRules.length} alert rule`);

  // Alerts (2: 1 WARNING, 1 RESOLVED)
  const boutiqueAlerts = buildBoutiqueAlerts(boutiqueAlertRules);
  for (const a of boutiqueAlerts) {
    await prisma.alert.create({ data: a });
  }
  console.log(`   Created ${boutiqueAlerts.length} alerts (1 warning, 1 resolved)`);

  // Metric Data Points (~504: 3 properties x 24 months x 7 metrics)
  console.log("   Generating metric data points...");
  const boutiqueProperties = [
    { id: ids.theLinden, customerId: ids.boutique, unitCount: 42, name: "The Linden" },
    { id: ids.elmAndMain, customerId: ids.boutique, unitCount: 36, name: "Elm & Main" },
    { id: ids.theWhitmore, customerId: ids.boutique, unitCount: 28, name: "The Whitmore" },
  ];
  const boutiquePoints = generateBoutiqueMetricDataPoints(boutiqueProperties, metricMap);

  const BATCH_SIZE = 500;
  for (let i = 0; i < boutiquePoints.length; i += BATCH_SIZE) {
    const batch = boutiquePoints.slice(i, i + BATCH_SIZE);
    await prisma.metricDataPoint.createMany({ data: batch });
    console.log(`   ... ${Math.min(i + BATCH_SIZE, boutiquePoints.length)} / ${boutiquePoints.length} data points`);
  }
  console.log(`   Created ${boutiquePoints.length} metric data points`);

  return {
    dataSources: 1,
    reports: boutiqueReports.length,
    alertRules: boutiqueAlertRules.length,
    alerts: boutiqueAlerts.length,
    dataPoints: boutiquePoints.length,
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🗑️  Clearing existing data...");

  await prisma.alert.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.contextualThreshold.deleteMany();
  await prisma.metricDataPoint.deleteMany();
  await prisma.reportSchedule.deleteMany();
  await prisma.customerReport.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.savedQuery.deleteMany();
  await prisma.dataImport.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.mappingTemplate.deleteMany();
  await prisma.chartOfAccountsMapping.deleteMany();
  await prisma.customerMetricOverride.deleteMany();
  await prisma.metricDefinition.deleteMany();
  await prisma.dimensionDefinition.deleteMany();
  await prisma.property.deleteMany();
  await prisma.ownershipEntity.deleteMany();
  await prisma.customer.deleteMany();

  console.log("✅ Database cleared\n");

  // 1. Customers
  console.log("👥 Seeding customers...");
  for (const c of customers) {
    await prisma.customer.create({ data: c });
  }
  console.log(`   Created ${customers.length} customers`);

  // 2. Ownership Entities
  console.log("🏢 Seeding ownership entities...");
  for (const e of ownershipEntities) {
    await prisma.ownershipEntity.create({ data: e });
  }
  console.log(`   Created ${ownershipEntities.length} entities`);

  // 3. Properties
  console.log("🏠 Seeding properties...");
  const properties = buildProperties();
  for (const p of properties) {
    await prisma.property.create({ data: p });
  }
  console.log(`   Created ${properties.length} properties`);

  // 4. Metric Definitions
  console.log("📊 Seeding metric definitions...");
  const metricDefs = buildMetricDefinitions();
  for (const m of metricDefs) {
    await prisma.metricDefinition.create({ data: m });
  }
  const metricMap = new Map(metricDefs.map((m) => [m.slug, m.id]));
  console.log(`   Created ${metricDefs.length} metrics`);

  // 5. Customer Metric Overrides (Greystar)
  console.log("🔧 Seeding customer metric overrides...");
  const overrides = [
    {
      id: cuid(),
      customerId: ids.greystar,
      baseMetricId: metricMap.get("occupancy_rate")!,
      formula: "(occupied_units + model_units) / total_units * 100",
      label: "Occupancy (Greystar Standard)",
      description: "Includes model units in occupied count per Greystar corporate policy",
      isDefault: true,
      effectiveDate: new Date("2024-01-01"),
      createdBy: "admin@greystar.com",
      approvedBy: "vp_ops@greystar.com",
    },
    {
      id: cuid(),
      customerId: ids.greystar,
      baseMetricId: metricMap.get("delinquency_rate")!,
      formula: "delinquent_units_5day / occupied_units * 100",
      label: "Delinquency Rate (5-Day Grace)",
      description: "Counts delinquency starting at 5 days past due instead of standard 1 day",
      isDefault: true,
      effectiveDate: new Date("2024-01-01"),
      createdBy: "admin@greystar.com",
      approvedBy: "vp_finance@greystar.com",
    },
    {
      id: cuid(),
      customerId: ids.greystar,
      baseMetricId: metricMap.get("collections_rate")!,
      formula: "(payments_received + credits) / (charges_billed - prepays) * 100",
      label: "Collections Rate (Net of Prepays)",
      description: "Excludes prepayments from billed amount denominator for more accurate collection tracking",
      isDefault: true,
      effectiveDate: new Date("2024-03-01"),
      createdBy: "admin@greystar.com",
      approvedBy: "vp_finance@greystar.com",
    },
  ];
  for (const o of overrides) {
    await prisma.customerMetricOverride.create({ data: o });
  }
  console.log(`   Created ${overrides.length} overrides`);

  // 6. Report Templates
  console.log("📋 Seeding report templates...");
  const templates = buildReportTemplates();
  for (const t of templates) {
    await prisma.reportTemplate.create({ data: t });
  }

  // Custom template for AI-generated reports
  await prisma.reportTemplate.upsert({
    where: { slug: "custom-ai-generated" },
    update: {},
    create: {
      name: "Custom (AI Generated)",
      slug: "custom-ai-generated",
      description: "Reports created via AI prompt or manual composition",
      category: "custom",
      templateType: "custom",
      metricRefs: "[]",
      defaultFilters: "{}",
      layoutConfig: "{}",
      isActive: true,
      sortOrder: 0,
    },
  });

  console.log(`   Created ${templates.length + 1} templates (${templates.filter((t) => t.isActive).length + 1} active, ${templates.filter((t) => !t.isActive).length} coming soon)`);

  // 7. Customer Reports
  console.log("📑 Seeding customer reports...");
  const reports = buildCustomerReports(ids.greystar);
  for (const r of reports) {
    await prisma.customerReport.create({ data: r });
  }
  console.log(`   Created ${reports.length} saved reports for Greystar`);

  // 8. Alert Rules & Alerts
  console.log("🚨 Seeding alert rules...");
  const alertRules = buildAlertRules(ids.greystar, metricMap);
  for (const r of alertRules) {
    await prisma.alertRule.create({ data: r });
  }
  console.log(`   Created ${alertRules.length} alert rules`);

  console.log("⚠️  Seeding alerts...");
  const alerts = buildAlerts(alertRules);
  for (const a of alerts) {
    await prisma.alert.create({ data: a });
  }
  console.log(`   Created ${alerts.length} alerts (2 critical, 3 warning, 5 resolved)`);

  // 9. Data Sources
  console.log("🔌 Seeding data sources...");
  const dataSources = buildDataSources(ids.greystar);
  for (const ds of dataSources) {
    await prisma.dataSource.create({ data: ds });
  }
  console.log(`   Created ${dataSources.length} data sources`);

  // 10. Metric Data Points
  console.log("📈 Seeding metric data points (this may take a moment)...");
  const propSummaries = properties.map((p) => ({
    id: p.id, customerId: p.customerId, unitCount: p.unitCount, name: p.name,
  }));
  const dataPoints = generateMetricDataPoints(propSummaries, metricMap);

  const BATCH_SIZE = 500;
  for (let i = 0; i < dataPoints.length; i += BATCH_SIZE) {
    const batch = dataPoints.slice(i, i + BATCH_SIZE);
    await prisma.metricDataPoint.createMany({ data: batch });
    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`   ... ${Math.min(i + BATCH_SIZE, dataPoints.length)} / ${dataPoints.length} data points`);
    }
  }
  console.log(`   Created ${dataPoints.length} metric data points`);

  // 11. Trinity Data
  console.log("\n👥 Seeding Trinity data...");
  const trinityResult = await seedTrinityData(metricMap);

  // 12. Boutique Data
  console.log("\n👥 Seeding Boutique data...");
  const boutiqueResult = await seedBoutiqueData(metricMap);

  // Summary
  const totalReports = reports.length + trinityResult.reports + boutiqueResult.reports;
  const totalAlertRules = alertRules.length + trinityResult.alertRules + boutiqueResult.alertRules;
  const totalAlerts = alerts.length + trinityResult.alerts + boutiqueResult.alerts;
  const totalDataSources = dataSources.length + trinityResult.dataSources + boutiqueResult.dataSources;
  const totalOverrides = overrides.length + trinityResult.overrides;
  const totalDataPoints = dataPoints.length + trinityResult.dataPoints + boutiqueResult.dataPoints;

  console.log("\n─── SEED COMPLETE ────────────────────────────────");
  console.log(`   Customers:        ${customers.length}`);
  console.log(`   Entities:         ${ownershipEntities.length}`);
  console.log(`   Properties:       ${properties.length}`);
  console.log(`   Metrics:          ${metricDefs.length}`);
  console.log(`   Overrides:        ${totalOverrides} (Greystar: ${overrides.length}, Trinity: ${trinityResult.overrides})`);
  console.log(`   Report Templates: ${templates.length}`);
  console.log(`   Customer Reports: ${totalReports} (Greystar: ${reports.length}, Trinity: ${trinityResult.reports}, Boutique: ${boutiqueResult.reports})`);
  console.log(`   Alert Rules:      ${totalAlertRules} (Greystar: ${alertRules.length}, Trinity: ${trinityResult.alertRules}, Boutique: ${boutiqueResult.alertRules})`);
  console.log(`   Alerts:           ${totalAlerts} (Greystar: ${alerts.length}, Trinity: ${trinityResult.alerts}, Boutique: ${boutiqueResult.alerts})`);
  console.log(`   Data Sources:     ${totalDataSources} (Greystar: ${dataSources.length}, Trinity: ${trinityResult.dataSources}, Boutique: ${boutiqueResult.dataSources})`);
  console.log(`   Data Points:      ${totalDataPoints} (Greystar: ${dataPoints.length}, Trinity: ${trinityResult.dataPoints}, Boutique: ${boutiqueResult.dataPoints})`);
  console.log("──────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
