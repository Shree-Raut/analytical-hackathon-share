import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const knowledgeDir = resolve(process.cwd(), "knowledge");

interface BundleEntry {
  key: string;
  displayName: string;
  aliases?: string[];
  description: string;
  fieldKind: string;
  dataType: string;
  primaryTopic: string;
  cursorPriority: string;
  usageCount: number;
}

function dataTypeToFormat(dataType: string): string {
  switch (dataType) {
    case "currency": return "currency";
    case "percent": return "percent";
    case "integer": case "float": return "number";
    case "date": case "datetime": return "number";
    default: return "number";
  }
}

function topicToCategory(topic: string, fieldKind: string): string {
  if (fieldKind === "dimension") return "dimension";
  switch (topic) {
    case "financial": return "revenue";
    case "quantity": return "leasing";
    case "status": return "leasing";
    case "entity": return "resident";
    case "identifier": return "maintenance";
    default: return "ai";
  }
}

async function run() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const dbPath = resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter } as any);

  const metricsFile = join(knowledgeDir, "fast-pass-rdb-columns.core-metrics.json");
  const dimensionsFile = join(knowledgeDir, "fast-pass-rdb-columns.core-dimensions.json");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of [metricsFile, dimensionsFile]) {
    if (!existsSync(file)) {
      console.log(`Skipping ${file} — not found`);
      continue;
    }
    const entries: BundleEntry[] = JSON.parse(readFileSync(file, "utf8"));
    console.log(`Processing ${entries.length} entries from ${file.split("/").pop()}`);

    for (const entry of entries) {
      if (!entry.key || !entry.displayName) {
        skipped++;
        continue;
      }

      const existing = await prisma.metricDefinition.findUnique({
        where: { slug: entry.key },
        select: { id: true },
      });

      if (existing) {
        await prisma.metricDefinition.update({
          where: { id: existing.id },
          data: {
            description: entry.description || "",
            dimensions: JSON.stringify(entry.aliases || []),
          },
        });
        updated++;
      } else {
        await prisma.metricDefinition.create({
          data: {
            name: entry.displayName,
            slug: entry.key,
            description: entry.description || `${entry.displayName} (${entry.fieldKind})`,
            formula: entry.fieldKind === "dimension" ? "dimension" : "sum",
            format: dataTypeToFormat(entry.dataType),
            category: topicToCategory(entry.primaryTopic, entry.fieldKind),
            sourceSystem: "pms",
            dimensions: JSON.stringify(entry.aliases || []),
            certificationTier: entry.cursorPriority === "core" ? "CANONICAL" : "SECONDARY",
            isActive: true,
            sortOrder: Math.max(0, 1000 - entry.usageCount),
          },
        });
        created++;
      }
    }
  }

  const totalMetrics = await prisma.metricDefinition.count({ where: { isActive: true } });
  console.log(`\nDone: created=${created}, updated=${updated}, skipped=${skipped}`);
  console.log(`Total active MetricDefinitions: ${totalMetrics}`);

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : "seed-bundle-metrics failed");
  process.exit(1);
});
