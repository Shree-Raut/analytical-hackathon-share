import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      portfolioSize: true,
      tier: true,
    },
    orderBy: { portfolioSize: "desc" },
  });
  return NextResponse.json(customers);
}
