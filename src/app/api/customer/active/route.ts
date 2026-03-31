import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("activeCustomerId")?.value;

    let customer;
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, slug: true, portfolioSize: true, tier: true },
      });
    }

    if (!customer) {
      customer = await prisma.customer.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true, portfolioSize: true, tier: true },
      });
    }

    if (!customer) {
      return NextResponse.json(null);
    }

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json(
      { error: "Failed to get active customer" },
      { status: 500 },
    );
  }
}
