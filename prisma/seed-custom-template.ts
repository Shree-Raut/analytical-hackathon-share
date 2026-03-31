import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.resolve(__dirname, "..", "dev.db")}`,
});
const prisma = new PrismaClient({ adapter } as any);

async function main() {
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
  console.log("Custom template created/verified");
  await prisma.$disconnect();
}

main();
