import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
import XLSX from "xlsx";

const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const DEFAULT_MOCKUP_ROOT_CANDIDATES = [
  path.resolve(__dirname, "..", "..", "Knowledge", "Report Mock-ups & Requirements"),
  path.resolve(os.homedir(), "Downloads", "Report Mock-ups & Requirements"),
  path.resolve(os.homedir(), "Downloads", "Data & Reports Template"),
  path.resolve(os.homedir(), "Downloads"),
];

const CATEGORY_FOLDERS = [
  "1. Accounting",
  "2. Operations",
  "3. Leasing",
  "4. Marketing",
  "5. Maintenance",
  "6. Pricing",
  "7. Payments",
  "8. Utilities",
  "9. Communications",
  "10. System",
  "11. Tax Credits",
];

const CATEGORY_MAP: Record<string, string> = {
  "1. Accounting": "accounting",
  "2. Operations": "operations",
  "3. Leasing": "leasing",
  "4. Marketing": "marketing",
  "5. Maintenance": "maintenance",
  "6. Pricing": "pricing",
  "7. Payments": "payments",
  "8. Utilities": "utilities",
  "9. Communications": "communications",
  "10. System": "system",
  "11. Tax Credits": "tax-credits",
};

const EXCLUDED_DIRS = ["xarchived", "xxarchived", "inactive"];
const EXCLUDED_NAME_PATTERNS = ["do not use"];

function parseRoots(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function resolveMockUpsRoots(): string[] {
  const envRoots = [
    ...parseRoots(process.env.REPORT_TEMPLATES_ROOTS),
    ...parseRoots(process.env.REPORT_TEMPLATES_ROOT),
  ];

  const candidates =
    envRoots.length > 0 ? envRoots : DEFAULT_MOCKUP_ROOT_CANDIDATES;

  const roots: string[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = path.resolve(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (fs.existsSync(normalized) && fs.statSync(normalized).isDirectory()) {
      roots.push(normalized);
    }
  }

  if (roots.length === 0) {
    throw new Error(
      "Could not find template source folders. Set REPORT_TEMPLATES_ROOTS (comma-separated) or REPORT_TEMPLATES_ROOT to directories containing .xlsx templates.",
    );
  }

  return roots;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

let idCounter = 0;
function cuid(): string {
  idCounter++;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "cr";
  const ts = Date.now().toString(36);
  id += ts;
  const counterStr = idCounter.toString(36).padStart(4, "0");
  id += counterStr;
  while (id.length < 25) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id.slice(0, 25);
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-{2,}/g, "-");
}

function cleanReportName(filename: string): string {
  let name = filename.replace(/\.xlsx$/i, "");

  // Strip common prefixes/suffixes
  name = name.replace(/^WIP\s*[-_]\s*/i, "");
  name = name.replace(/^NEW\s*[-_]\s*/i, "");
  name = name.replace(/^Copy\s+of\s+/i, "");
  name = name.replace(/^OLD_/i, "");

  // Strip parenthetical annotations
  name = name.replace(/\s*\(New\)\s*/gi, " ");
  name = name.replace(/\s*\(new\)\s*/gi, " ");
  name = name.replace(/\s*\(Old\)\s*/gi, " ");
  name = name.replace(/\s*\(old\)\s*/gi, " ");
  name = name.replace(/\s*\(WIP\)\s*/gi, " ");

  // Strip trailing underscores and whitespace
  name = name.replace(/_+$/, "");
  name = name.replace(/\s+/g, " ").trim();

  return name;
}

function isExcludedPath(filePath: string): boolean {
  const parts = filePath.toLowerCase().split(path.sep);
  return parts.some((p) => EXCLUDED_DIRS.includes(p));
}

function isExcludedFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  return EXCLUDED_NAME_PATTERNS.some((pat) => lower.includes(pat));
}

function getSubcategory(filePath: string, categoryFolder: string, root: string): string {
  const relative = path.relative(
    path.join(root, categoryFolder),
    filePath,
  );
  const parts = relative.split(path.sep);
  if (parts.length > 1) {
    return toSlug(parts[0]);
  }
  return "general";
}

function inferCategory(filePath: string): string {
  const value = filePath.toLowerCase();
  if (value.includes("accounting") || value.includes("income") || value.includes("balance")) {
    return "accounting";
  }
  if (value.includes("leasing") || value.includes("lead") || value.includes("tour")) {
    return "leasing";
  }
  if (value.includes("maintenance") || value.includes("work order")) {
    return "maintenance";
  }
  if (value.includes("pricing") || value.includes("rent")) {
    return "pricing";
  }
  if (value.includes("payment") || value.includes("delinquency")) {
    return "payments";
  }
  if (value.includes("utility")) {
    return "utilities";
  }
  if (value.includes("communication") || value.includes("email") || value.includes("call")) {
    return "communications";
  }
  if (value.includes("tax")) {
    return "tax-credits";
  }
  return "operations";
}

function getSubcategoryFromRoot(filePath: string, root: string): string {
  const relative = path.relative(root, filePath);
  const parts = relative.split(path.sep);
  return parts.length > 1 ? toSlug(parts[0]) : "general";
}

// ─── EXCEL READING ──────────────────────────────────────────────────────────

function findMockUpSheet(sheetNames: string[]): string | null {
  // Prefer sheets with "Mock" or "HTML" in the name
  for (const name of sheetNames) {
    const lower = name.toLowerCase();
    if (
      (lower.includes("mock") || lower.includes("html")) &&
      !lower.includes("read me") &&
      !lower.includes("readme")
    ) {
      return name;
    }
  }
  // Fall back to first sheet if it's not a README
  if (sheetNames.length > 0) {
    const first = sheetNames[0].toLowerCase();
    if (!first.includes("read me") && !first.includes("readme")) {
      return sheetNames[0];
    }
    if (sheetNames.length > 1) return sheetNames[1];
  }
  return sheetNames[0] || null;
}

function extractHeaders(workbook: XLSX.WorkBook): string[] {
  const sheetName = findMockUpSheet(workbook.SheetNames);
  if (!sheetName) return [];

  try {
    const ws = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Scan the first 10 rows for the best header row:
    // the one with the most non-null string values that look like column labels
    let bestRow: string[] = [];
    let bestScore = 0;

    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (!row) continue;

      const strings = row
        .filter(
          (c: any) =>
            typeof c === "string" && c.trim().length > 0 && c.length < 100,
        )
        .map((c: any) => c.trim());

      // Skip rows that look like filter descriptions or section headers
      if (
        strings.length === 1 &&
        (strings[0].toLowerCase().startsWith("filter") ||
          strings[0].toLowerCase().startsWith("property:"))
      ) {
        continue;
      }

      // Skip rows where all values contain "optional" or "dependent"
      const allAnnotations = strings.every(
        (s: string) =>
          s.toLowerCase().includes("optional") ||
          s.toLowerCase().includes("dependent") ||
          s.startsWith("*") ||
          s.startsWith("["),
      );
      if (allAnnotations && strings.length > 0) continue;

      if (strings.length > bestScore) {
        bestScore = strings.length;
        bestRow = strings;
      }
    }

    return bestRow.slice(0, 50); // cap at 50 columns
  } catch {
    return [];
  }
}

function extractDescription(workbook: XLSX.WorkBook): string | null {
  const docSheetNames = ["Documentation", "Client Requirements", "Requirements"];
  for (const name of docSheetNames) {
    const match = workbook.SheetNames.find(
      (s) => s.toLowerCase() === name.toLowerCase(),
    );
    if (!match) continue;

    try {
      const ws = workbook.Sheets[match];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        if (!row) continue;
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (
            typeof cell === "string" &&
            cell.toLowerCase().includes("description")
          ) {
            // Grab adjacent cell(s)
            const adjacent = row[j + 1];
            if (typeof adjacent === "string" && adjacent.trim().length > 10) {
              return adjacent.trim();
            }
            // Check next row same column
            if (data[i + 1] && typeof data[i + 1][j] === "string") {
              return (data[i + 1][j] as string).trim();
            }
          }
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ─── DIRECTORY WALKER ───────────────────────────────────────────────────────

function walkXlsx(dir: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name.toLowerCase())) {
          walk(fullPath);
        }
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".xlsx") &&
        !entry.name.startsWith("~$") &&
        !isExcludedFilename(entry.name)
      ) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

// ─── BUILD TEMPLATES ────────────────────────────────────────────────────────

interface TemplateRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  templateType: string;
  metricRefs: string;
  defaultFilters: string;
  layoutConfig: string;
  isActive: boolean;
  sortOrder: number;
}

function buildTemplates(): TemplateRecord[] {
  const templates: TemplateRecord[] = [];
  const slugCounts = new Map<string, number>();
  const sourceRoots = resolveMockUpsRoots();
  const filesWithCategory: Array<{
    filePath: string;
    category: string;
    subcategory: string;
    sourceBucket: string;
  }> = [];
  const seenFilePaths = new Set<string>();

  for (const root of sourceRoots) {
    const folderPlans = CATEGORY_FOLDERS
      .map((folder) => ({
        folder,
        folderPath: path.join(root, folder),
        category: CATEGORY_MAP[folder],
      }))
      .filter(
        (plan) =>
          fs.existsSync(plan.folderPath) && fs.statSync(plan.folderPath).isDirectory(),
      );

    const useCategorizedFolders = folderPlans.length > 0;
    const rootFiles = useCategorizedFolders
      ? folderPlans.flatMap((plan) =>
          walkXlsx(plan.folderPath).map((filePath) => ({
            filePath,
            category: plan.category,
            subcategory: getSubcategory(filePath, plan.folder, root),
            sourceBucket: `${path.basename(root)}:${plan.folder}`,
          })),
        )
      : walkXlsx(root).map((filePath) => ({
          filePath,
          category: inferCategory(filePath),
          subcategory: getSubcategoryFromRoot(filePath, root),
          sourceBucket: `${path.basename(root)}:discovered`,
        }));

    const bucketCounts = new Map<string, number>();
    for (const f of rootFiles) {
      const normalized = path.resolve(f.filePath);
      if (seenFilePaths.has(normalized)) continue;
      seenFilePaths.add(normalized);
      filesWithCategory.push(f);
      bucketCounts.set(f.sourceBucket, (bucketCounts.get(f.sourceBucket) || 0) + 1);
    }

    console.log(`  📁 source: ${root}`);
    for (const [bucket, count] of Array.from(bucketCounts.entries()).sort()) {
      console.log(`    📂 ${bucket}: ${count} files`);
    }
  }

  filesWithCategory.sort((a, b) => a.filePath.localeCompare(b.filePath));

  let sortOrder = 0;
  for (const file of filesWithCategory) {
    sortOrder++;
    const filename = path.basename(file.filePath);
    const reportName = cleanReportName(filename);

    let baseSlug = toSlug(reportName);
    if (!baseSlug) baseSlug = `${file.category}-report-${sortOrder}`;

    // Track slug uniqueness
    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);
    const slug = count > 0 ? `${file.category}-${baseSlug}` : baseSlug;
    // Also register the prefixed version
    if (count > 0) {
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    }

    let headers: string[] = [];
    let description: string | null = null;

    try {
      const workbook = XLSX.readFile(file.filePath);
      headers = extractHeaders(workbook);
      description = extractDescription(workbook);
    } catch (err: any) {
      console.log(
        `    ⚠ Could not read ${filename}: ${err.message?.slice(0, 60)}`,
      );
    }

    if (!description) {
      const prettyCategory =
        file.category.charAt(0).toUpperCase() + file.category.slice(1);
      description = `Standard ${prettyCategory} report for ${reportName}`;
    }

    templates.push({
      id: cuid(),
      name: reportName,
      slug,
      description,
      category: file.category,
      templateType: file.subcategory,
      metricRefs: JSON.stringify(headers),
      defaultFilters: "{}",
      layoutConfig: JSON.stringify({
        columns: headers,
        source: "mock-up",
      }),
      isActive: true,
      sortOrder,
    });
  }

  // Second pass: resolve remaining slug collisions
  const finalSlugs = new Set<string>();
  for (const tpl of templates) {
    let s = tpl.slug;
    let attempt = 0;
    while (finalSlugs.has(s)) {
      attempt++;
      s = `${tpl.category}-${tpl.slug.replace(`${tpl.category}-`, "")}-${attempt}`;
    }
    finalSlugs.add(s);
    tpl.slug = s;
  }

  return templates;
}

// ─── CUSTOMER REPORTS ───────────────────────────────────────────────────────

interface CustomerReportRecord {
  id: string;
  customerId: string;
  templateId: string;
  name: string;
  filters: string;
  metricOverrides: string;
  layoutOverrides: string;
  tier: string;
  ownerId?: string;
  teamId?: string;
  notes?: string;
}

function buildSampleCustomerReports(
  templates: TemplateRecord[],
  greystarCustomerId: string,
): CustomerReportRecord[] {
  const reports: CustomerReportRecord[] = [];

  const findTemplate = (category: string, namePart: string) =>
    templates.find(
      (t) =>
        t.category === category &&
        t.name.toLowerCase().includes(namePart.toLowerCase()),
    );

  // 5 Accounting
  const accountingPicks = [
    { name: "Income Statement", search: "income statement" },
    { name: "Balance Sheet", search: "balance sheet" },
    { name: "AP Aging", search: "ap aging" },
    { name: "Trial Balance", search: "trial balance" },
    { name: "GL Details", search: "gl details" },
  ];

  // 5 Operations
  const operationsPicks = [
    { name: "Box Score", search: "box score" },
    { name: "Rent Roll", search: "rent roll" },
    { name: "Delinquency", search: "delinquency" },
    { name: "Daily Operations", search: "daily" },
    { name: "Expiring Leases", search: "expiring leases" },
  ];

  // 3 Leasing
  const leasingPicks = [
    { name: "Lead Conversion", search: "lead conversion" },
    { name: "Traffic and Events", search: "traffic and events" },
    { name: "Contact Points Analysis", search: "contact points" },
  ];

  // 2 Communications
  const commsPicks = [
    { name: "Call Tracking Summary", search: "call tracking summary" },
    { name: "Email Conversion Rate", search: "email conversion" },
  ];

  const allPicks = [
    ...accountingPicks.map((p) => ({ ...p, category: "accounting" })),
    ...operationsPicks.map((p) => ({ ...p, category: "operations" })),
    ...leasingPicks.map((p) => ({ ...p, category: "leasing" })),
    ...commsPicks.map((p) => ({ ...p, category: "communications" })),
  ];

  const tiers = [
    "PERSONAL",
    "PERSONAL",
    "PERSONAL",
    "TEAM",
    "TEAM",
    "TEAM",
    "TEAM",
    "TEAM",
    "PUBLISHED",
    "PUBLISHED",
    "PUBLISHED",
    "PUBLISHED",
    "CERTIFIED",
    "CERTIFIED",
    "CERTIFIED",
  ];

  for (let i = 0; i < allPicks.length; i++) {
    const pick = allPicks[i];
    const tpl = findTemplate(pick.category, pick.search);

    if (!tpl) {
      console.log(
        `    ⚠ Could not find template for "${pick.name}" in ${pick.category}`,
      );
      continue;
    }

    const tier = tiers[i] || "PERSONAL";

    reports.push({
      id: cuid(),
      customerId: greystarCustomerId,
      templateId: tpl.id,
      name: `Greystar - ${pick.name}`,
      filters: JSON.stringify({ dateRange: "last_12_months" }),
      metricOverrides: "{}",
      layoutOverrides: "{}",
      tier,
      ownerId: tier === "PERSONAL" ? "user_jsmith" : undefined,
      teamId: ["TEAM"].includes(tier) ? "ops" : undefined,
      notes:
        tier === "CERTIFIED"
          ? "Approved by VP Finance — locked for audit"
          : undefined,
    });
  }

  return reports;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Report Catalog Seed — from Excel Mock-ups");
  console.log("═══════════════════════════════════════════════════\n");
  const sourceRoots = resolveMockUpsRoots();
  console.log("  Sources:");
  for (const root of sourceRoots) {
    console.log(`    - ${root}`);
  }
  console.log("");

  // 1. Build templates from xlsx files
  console.log("📑 Scanning Excel mock-up files...\n");
  const templates = buildTemplates();
  if (templates.length === 0) {
    throw new Error(
      "No templates were built from the configured source. Aborting to avoid clearing existing report templates.",
    );
  }
  console.log(`\n  ✅ Built ${templates.length} ReportTemplate records\n`);

  // 2. Clear existing data
  console.log("🗑️  Clearing existing ReportTemplate & CustomerReport data...");
  await prisma.reportSchedule.deleteMany();
  await prisma.customerReport.deleteMany();
  await prisma.reportTemplate.deleteMany();
  console.log("  ✅ Cleared\n");

  // 3. Insert templates in batches
  console.log("💾 Inserting templates...");
  const BATCH_SIZE = 100;
  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    const batch = templates.slice(i, i + BATCH_SIZE);
    await prisma.reportTemplate.createMany({ data: batch });
    console.log(
      `  ... ${Math.min(i + BATCH_SIZE, templates.length)} / ${templates.length}`,
    );
  }
  console.log(`  ✅ Inserted ${templates.length} templates\n`);

  // 4. Create sample CustomerReports for Greystar
  console.log("👤 Creating sample CustomerReports for Greystar...");
  const greystar = await prisma.customer.findFirst({
    where: { slug: "greystar" },
  });

  if (!greystar) {
    console.log(
      "  ⚠ Greystar customer not found — run seed.ts first. Skipping CustomerReports.",
    );
  } else {
    const customerReports = buildSampleCustomerReports(
      templates,
      greystar.id,
    );
    if (customerReports.length > 0) {
      await prisma.customerReport.createMany({ data: customerReports });
    }
    console.log(
      `  ✅ Created ${customerReports.length} CustomerReport records\n`,
    );

    const tierCounts = customerReports.reduce(
      (acc, r) => {
        acc[r.tier] = (acc[r.tier] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    console.log("  Tier breakdown:");
    for (const [tier, count] of Object.entries(tierCounts)) {
      console.log(`    ${tier}: ${count}`);
    }
  }

  // 5. Summary
  const categoryBreakdown = templates.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  SEED COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Total ReportTemplates: ${templates.length}`);
  console.log("\n  By category:");
  for (const [cat, count] of Object.entries(categoryBreakdown).sort()) {
    console.log(`    ${cat.padEnd(18)} ${count}`);
  }
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
