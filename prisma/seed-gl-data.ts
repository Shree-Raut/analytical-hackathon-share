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

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

// ─── CONFIGURATION ─────────────────────────────────────────────────────────

const PERIODS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];

const NEW_METRIC_DEFS = [
  {
    slug: "gain_to_lease",
    name: "Gain to Lease",
    description: "Revenue gain when actual lease rates exceed market rent",
    formula: "SUM(unit_actual_rent - unit_market_rent) WHERE actual > market",
    format: "currency",
    category: "revenue",
    sourceSystem: "pms",
    sortOrder: 2,
  },
  {
    slug: "marketing_expense",
    name: "Marketing & Advertising",
    description: "Marketing, advertising, and promotional expenses",
    formula: "SUM(marketing_charges + advertising_charges)",
    format: "currency",
    category: "expense",
    sourceSystem: "pms",
    sortOrder: 19,
  },
  {
    slug: "administrative",
    name: "Administrative & Office",
    description: "Office supplies, professional services, and general administrative costs",
    formula: "SUM(admin_charges + office_supplies + professional_services)",
    format: "currency",
    category: "expense",
    sourceSystem: "pms",
    sortOrder: 20,
  },
  {
    slug: "contract_services",
    name: "Contract Services",
    description: "Third-party contracted services including landscaping, pest control, and security",
    formula: "SUM(contract_charges)",
    format: "currency",
    category: "expense",
    sourceSystem: "pms",
    sortOrder: 21,
  },
  {
    slug: "property_taxes",
    name: "Property Taxes",
    description: "Real estate and property tax obligations",
    formula: "SUM(property_tax_assessment)",
    format: "currency",
    category: "expense",
    sourceSystem: "pms",
    sortOrder: 22,
  },
  {
    slug: "capital_expenditures",
    name: "Capital Expenditures",
    description: "Capital improvement and replacement costs",
    formula: "SUM(capex_charges)",
    format: "currency",
    category: "expense",
    sourceSystem: "pms",
    sortOrder: 59,
  },
  {
    slug: "total_controllable_expense",
    name: "Total Controllable Expense",
    description: "Sum of all controllable operating expenses",
    formula: "payroll + repairs_maintenance + marketing_expense + administrative + contract_services",
    format: "currency",
    category: "expense",
    sourceSystem: "derived",
    sortOrder: 23,
  },
  {
    slug: "total_non_controllable_expense",
    name: "Total Non-Controllable Expense",
    description: "Sum of all non-controllable operating expenses",
    formula: "utilities + insurance + property_taxes + management_fee",
    format: "currency",
    category: "expense",
    sourceSystem: "derived",
    sortOrder: 24,
  },
  {
    slug: "net_operating_income",
    name: "Net Operating Income",
    description: "Revenue remaining after all operating expenses",
    formula: "effective_gross_income - total_operating_expense",
    format: "currency",
    category: "financial",
    sourceSystem: "derived",
    sortOrder: 49,
  },
];

const GL_SLUGS = [
  "gross_potential_rent", "gain_to_lease", "loss_to_lease", "vacancy_loss",
  "concessions", "bad_debt", "other_income", "net_rental_income", "effective_gross_income",
  "payroll", "repairs_maintenance", "marketing_expense", "administrative", "contract_services",
  "utilities", "insurance", "property_taxes", "management_fee",
  "capital_expenditures",
  "total_controllable_expense", "total_non_controllable_expense",
  "total_operating_expense", "net_operating_income",
];

const LEASING_SLUGS = [
  "move_ins", "move_outs", "leases_signed", "lead_volume",
  "tours_scheduled", "applications_received", "renewal_rate",
];

const ALL_SLUGS = [...GL_SLUGS, ...LEASING_SLUGS];

// ─── DATA GENERATION ───────────────────────────────────────────────────────

interface PropertyInfo {
  id: string;
  name: string;
  unitCount: number;
  classType: string;
  customerId: string;
}

function generatePropertyData(
  properties: PropertyInfo[],
  metricMap: Map<string, string>,
  customerId: string,
) {
  const dataPoints: Array<{
    id: string;
    metricId: string;
    propertyId: string;
    customerId: string;
    period: string;
    value: number;
    previousValue: number | null;
    budgetValue: number | null;
  }> = [];

  for (const prop of properties) {
    const units = prop.unitCount;
    const isClassA = prop.classType === "Class A";

    // Stable property-level parameters
    const baseRent = isClassA ? randomFloat(1800, 2200) : randomFloat(1500, 1800);
    const baseVacancyRate = randomFloat(0.03, 0.07);
    const baseLtlRate = randomFloat(0.02, 0.04);
    const baseConcessionRate = randomFloat(0.01, 0.02);
    const baseBadDebtRate = randomFloat(0.005, 0.015);
    const baseOtherPerUnit = randomFloat(50, 150);

    const payrollRate = randomFloat(0.25, 0.30);
    const rmRate = randomFloat(0.08, 0.12);
    const marketingRate = randomFloat(0.02, 0.04);
    const adminRate = randomFloat(0.03, 0.05);
    const contractRate = randomFloat(0.02, 0.04);
    const utilitiesRate = randomFloat(0.05, 0.08);
    const insuranceRate = randomFloat(0.03, 0.05);
    const taxRate = randomFloat(0.10, 0.15);
    const mgmtFeeRate = randomFloat(0.03, 0.04);
    const capexPerUnit = randomFloat(200, 500) / 12;

    let prevValues: Record<string, number> = {};

    for (let i = 0; i < PERIODS.length; i++) {
      const period = PERIODS[i];
      const monthIdx = parseInt(period.split("-")[1]) - 1;
      const seasonal = Math.sin((monthIdx - 3) * Math.PI / 6);
      const jitter = () => (Math.random() - 0.5) * 0.04;

      // ── Revenue ──
      const rentPerUnit = baseRent * (1 + seasonal * 0.02 + jitter());
      const gpr = Math.round(rentPerUnit * units);
      const gainToLease = Math.round(gpr * randomFloat(0, 0.005));
      const ltl = Math.round(gpr * baseLtlRate * (1 + jitter()));
      const vacancyLoss = Math.round(gpr * baseVacancyRate * (1 + seasonal * 0.1 + jitter()));
      const concessions = Math.round(gpr * baseConcessionRate * (1 + jitter()));
      const badDebt = Math.round(gpr * baseBadDebtRate * (1 + jitter()));
      const otherIncome = Math.round(baseOtherPerUnit * (1 + jitter()) * units);
      const nri = gpr + gainToLease - ltl - vacancyLoss - concessions - badDebt;
      const egi = nri + otherIncome;

      // ── Controllable Expenses ──
      const payroll = Math.round(egi * payrollRate * (1 + jitter()));
      const rm = Math.round(egi * rmRate * (1 + jitter()));
      const marketing = Math.round(egi * marketingRate * (1 + jitter()));
      const admin = Math.round(egi * adminRate * (1 + jitter()));
      const contractSvcs = Math.round(egi * contractRate * (1 + jitter()));
      const totalControllable = payroll + rm + marketing + admin + contractSvcs;

      // ── Non-Controllable Expenses ──
      const utilities = Math.round(egi * utilitiesRate * (1 + jitter()));
      const insurance = Math.round(egi * insuranceRate * (1 + jitter()));
      const propTaxes = Math.round(egi * taxRate * (1 + jitter()));
      const mgmtFee = Math.round(egi * mgmtFeeRate * (1 + jitter()));
      const totalNonControllable = utilities + insurance + propTaxes + mgmtFee;

      // ── Capital & Derived ──
      const capex = Math.round(capexPerUnit * units * (1 + jitter()));
      const totalOpex = totalControllable + totalNonControllable;
      const noi = egi - totalOpex;

      // ── Leasing ──
      const velocity = Math.max(2, Math.round(units * 0.03 + seasonal * 3 + (Math.random() - 0.5) * 4));
      const moveIns = Math.max(1, Math.round(velocity * randomFloat(0.8, 1.1)));
      const moveOuts = Math.max(1, Math.round(velocity * randomFloat(0.6, 0.9)));
      const leasesSigned = Math.max(1, Math.round(velocity * randomFloat(0.9, 1.2)));
      const leadVolume = Math.max(5, Math.round(velocity * randomFloat(4, 6)));
      const toursScheduled = Math.max(2, Math.round(leadVolume * randomFloat(0.4, 0.6)));
      const appsReceived = Math.max(1, Math.round(toursScheduled * randomFloat(0.4, 0.7)));
      const renewalRate = randomFloat(50, 70);

      const values: Record<string, number> = {
        gross_potential_rent: gpr,
        gain_to_lease: gainToLease,
        loss_to_lease: ltl,
        vacancy_loss: vacancyLoss,
        concessions: concessions,
        bad_debt: badDebt,
        other_income: otherIncome,
        net_rental_income: nri,
        effective_gross_income: egi,
        payroll,
        repairs_maintenance: rm,
        marketing_expense: marketing,
        administrative: admin,
        contract_services: contractSvcs,
        utilities,
        insurance,
        property_taxes: propTaxes,
        management_fee: mgmtFee,
        capital_expenditures: capex,
        total_controllable_expense: totalControllable,
        total_non_controllable_expense: totalNonControllable,
        total_operating_expense: totalOpex,
        net_operating_income: noi,
        move_ins: moveIns,
        move_outs: moveOuts,
        leases_signed: leasesSigned,
        lead_volume: leadVolume,
        tours_scheduled: toursScheduled,
        applications_received: appsReceived,
        renewal_rate: renewalRate,
      };

      for (const [slug, value] of Object.entries(values)) {
        const metricId = metricMap.get(slug);
        if (!metricId) continue;

        const budgetVariance = randomFloat(-0.05, 0.05);
        const budgetValue = Math.round(value * (1 + budgetVariance));

        dataPoints.push({
          id: cuid(),
          metricId,
          propertyId: prop.id,
          customerId,
          period,
          value: parseFloat(value.toFixed(2)),
          previousValue: prevValues[slug] != null ? parseFloat(prevValues[slug].toFixed(2)) : null,
          budgetValue,
        });
      }

      prevValues = values;
    }
  }

  return dataPoints;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏗️  GL Data Seed — Starting...\n");

  const greystar = await prisma.customer.findUnique({ where: { slug: "greystar" } });
  if (!greystar) throw new Error("Greystar customer not found — run the main seed first.");
  console.log(`✅ Found Greystar (${greystar.id})`);

  const properties = await prisma.property.findMany({
    where: { customerId: greystar.id },
    orderBy: { name: "asc" },
  });
  console.log(`✅ Found ${properties.length} Greystar properties`);

  // Create new MetricDefinition records
  console.log("\n📊 Upserting metric definitions...");
  for (const def of NEW_METRIC_DEFS) {
    await prisma.metricDefinition.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        id: cuid(),
        ...def,
        certificationTier: "CANONICAL",
        isActive: true,
        dimensions: JSON.stringify(["property", "period", "entity"]),
      },
    });
  }
  console.log(`   Upserted ${NEW_METRIC_DEFS.length} metric definitions`);

  // Look up all metric IDs
  const allMetrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: ALL_SLUGS } },
  });
  const metricMap = new Map(allMetrics.map((m) => [m.slug, m.id]));
  const missing = ALL_SLUGS.filter((s) => !metricMap.has(s));
  if (missing.length > 0) {
    console.warn(`   ⚠️  Missing definitions for: ${missing.join(", ")}`);
  }
  console.log(`   Resolved ${metricMap.size}/${ALL_SLUGS.length} metric IDs`);

  // Clean existing data for these metrics/periods
  const metricIds = Array.from(metricMap.values());
  const deleted = await prisma.metricDataPoint.deleteMany({
    where: {
      customerId: greystar.id,
      metricId: { in: metricIds },
      period: { in: PERIODS },
    },
  });
  if (deleted.count > 0) {
    console.log(`   Cleaned ${deleted.count} existing data points`);
  }

  // Generate data
  console.log("\n📈 Generating GL + leasing data points...");
  const dataPoints = generatePropertyData(
    properties.map((p) => ({
      id: p.id,
      name: p.name,
      unitCount: p.unitCount,
      classType: p.classType,
      customerId: greystar.id,
    })),
    metricMap,
    greystar.id,
  );

  // Batch insert
  const BATCH_SIZE = 500;
  for (let i = 0; i < dataPoints.length; i += BATCH_SIZE) {
    const batch = dataPoints.slice(i, i + BATCH_SIZE);
    await prisma.metricDataPoint.createMany({ data: batch });
    if ((i / BATCH_SIZE) % 3 === 0) {
      console.log(`   ... ${Math.min(i + BATCH_SIZE, dataPoints.length)} / ${dataPoints.length}`);
    }
  }
  console.log(`   Created ${dataPoints.length} data points`);

  // Summary
  const glCount = dataPoints.filter((dp) => GL_SLUGS.some((s) => metricMap.get(s) === dp.metricId)).length;
  const leasingCount = dataPoints.length - glCount;

  console.log("\n─── GL SEED COMPLETE ──────────────────────────────");
  console.log(`   New Metric Defs:     ${NEW_METRIC_DEFS.length}`);
  console.log(`   Properties:          ${properties.length}`);
  console.log(`   Periods:             ${PERIODS.length} (${PERIODS[0]} — ${PERIODS[PERIODS.length - 1]})`);
  console.log(`   GL Data Points:      ${glCount}`);
  console.log(`   Leasing Data Points: ${leasingCount}`);
  console.log(`   Total Data Points:   ${dataPoints.length}`);
  console.log("────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ GL seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
