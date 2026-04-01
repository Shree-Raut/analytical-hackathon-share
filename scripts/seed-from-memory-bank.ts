import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const memoryBankPath = "/Users/kislay.raj/Code/Project/analytics/memory-bank/memory_bank.json";

interface MemoryBankColumn {
  columnId: number;
  column_name: string;
  column_key: string;
  description: string;
  data_type: string;
  format: string;
}

interface MemoryBankReport {
  report_name: string;
  report_id: string;
  report_description: string;
  report_category: string;
  report_columns: MemoryBankColumn[];
}

interface MemoryBankData {
  [reportKey: string]: MemoryBankReport[];
}

function dataTypeToFormat(dataType: string, format: string): string {
  const normalized = dataType.toLowerCase();
  const formatNormalized = format.toLowerCase();

  // Check format field first
  if (formatNormalized.includes("currency") || formatNormalized.includes("money")) {
    return "currency";
  }
  if (formatNormalized.includes("percent") || formatNormalized.includes("%")) {
    return "percent";
  }

  // Check data type
  switch (normalized) {
    case "currency":
    case "money":
    case "decimal":
      return "currency";
    case "percent":
    case "percentage":
      return "percent";
    case "integer":
    case "float":
    case "number":
      return "number";
    case "date":
    case "datetime":
    case "timestamp":
      return "number";
    default:
      return "number";
  }
}

function categoryFromReportCategory(reportCategory: string): string {
  const normalized = reportCategory.toLowerCase();

  if (normalized.includes("revenue") || normalized.includes("income")) {
    return "revenue";
  }
  if (normalized.includes("expense") || normalized.includes("cost")) {
    return "expense";
  }
  if (normalized.includes("leasing") || normalized.includes("occupancy")) {
    return "leasing";
  }
  if (normalized.includes("maintenance") || normalized.includes("work order")) {
    return "maintenance";
  }
  if (normalized.includes("resident") || normalized.includes("tenant")) {
    return "resident";
  }
  if (normalized.includes("financial") || normalized.includes("accounting")) {
    return "financial";
  }
  if (normalized.includes("balance")) {
    return "financial";
  }

  return "dimension";
}

function inferFormula(columnName: string, dataType: string): string {
  const normalized = columnName.toLowerCase();

  if (normalized.includes("rate") || normalized.includes("%") || normalized.includes("percent")) {
    return "ratio";
  }
  if (normalized.includes("count") || normalized.includes("total")) {
    return "sum";
  }
  if (normalized.includes("average") || normalized.includes("avg")) {
    return "avg";
  }

  // Default based on data type
  if (dataType === "text") {
    return "dimension";
  }

  return "sum";
}

function isValidMetric(column: MemoryBankColumn): boolean {
  // Skip invalid keys
  if (!column.column_key || typeof column.column_key !== "string" || column.column_key.length < 2) {
    return false;
  }

  // Skip section headers
  if (column.column_key.startsWith("section:")) {
    return false;
  }

  // Skip columns with very generic names
  const genericNames = ["id", "name", "description", "notes", "status"];
  if (genericNames.includes(column.column_key)) {
    return false;
  }

  return true;
}

async function run() {
  console.log("🚀 Starting Memory Bank seed process...\n");

  if (!existsSync(memoryBankPath)) {
    console.error(`❌ Memory bank file not found: ${memoryBankPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading memory bank from: ${memoryBankPath}`);
  const memoryBankData: MemoryBankData = JSON.parse(
    readFileSync(memoryBankPath, "utf8")
  );

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const dbPath = resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter } as any);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let totalColumns = 0;

  const reportKeys = Object.keys(memoryBankData);
  console.log(`📊 Found ${reportKeys.length} report types in memory bank\n`);

  // Track unique columns by slug to avoid duplicates
  const seenSlugs = new Set<string>();

  for (const reportKey of reportKeys) {
    const reports = memoryBankData[reportKey];

    for (const report of reports) {
      if (!report.report_columns || !Array.isArray(report.report_columns)) {
        continue;
      }

      console.log(`Processing: ${report.report_name} (${report.report_columns.length} columns)`);

      for (const column of report.report_columns) {
        totalColumns++;

        // Validate column
        if (!isValidMetric(column)) {
          skipped++;
          continue;
        }

        // Skip duplicates
        if (seenSlugs.has(column.column_key)) {
          skipped++;
          continue;
        }
        seenSlugs.add(column.column_key);

        const slug = column.column_key;
        const name = column.column_name;
        const description = column.description || `${column.column_name} from ${report.report_name}`;
        const format = dataTypeToFormat(column.data_type, column.format);
        const category = categoryFromReportCategory(report.report_category);
        const formula = inferFormula(column.column_name, column.data_type);

        try {
          // Check if metric already exists
          const existing = await prisma.metricDefinition.findUnique({
            where: { slug },
            select: { id: true },
          });

          if (existing) {
            // Update existing metric with new description and metadata
            await prisma.metricDefinition.update({
              where: { id: existing.id },
              data: {
                description,
                dimensions: JSON.stringify({
                  reportId: report.report_id,
                  reportName: report.report_name,
                  reportCategory: report.report_category,
                  columnId: column.columnId,
                }),
              },
            });
            updated++;
          } else {
            // Create new metric
            await prisma.metricDefinition.create({
              data: {
                name,
                slug,
                description,
                formula,
                format,
                category,
                sourceSystem: "memory_bank",
                certificationTier: "SECONDARY",
                isActive: true,
                sortOrder: 500,
                dimensions: JSON.stringify({
                  reportId: report.report_id,
                  reportName: report.report_name,
                  reportCategory: report.report_category,
                  columnId: column.columnId,
                }),
              },
            });
            created++;
          }
        } catch (error) {
          console.error(`  ⚠️  Error processing column ${slug}:`, error instanceof Error ? error.message : "unknown");
          skipped++;
        }
      }
    }
  }

  const totalMetrics = await prisma.metricDefinition.count({ where: { isActive: true } });

  console.log("\n" + "=".repeat(60));
  console.log("✅ Memory Bank Seed Complete!");
  console.log("=".repeat(60));
  console.log(`📊 Total columns processed: ${totalColumns}`);
  console.log(`✨ Created: ${created}`);
  console.log(`🔄 Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Total active metrics in database: ${totalMetrics}`);
  console.log("=".repeat(60) + "\n");

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error("\n❌ Seed failed:", err instanceof Error ? err.message : "unknown error");
  console.error(err);
  process.exit(1);
});
