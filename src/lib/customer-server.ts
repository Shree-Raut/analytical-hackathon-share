import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getActiveCustomerId(): Promise<string> {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("activeCustomerId")?.value;
  if (customerId) return customerId;

  const first = await prisma.customer.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return first?.id ?? "";
}

export async function getActiveCustomer() {
  const id = await getActiveCustomerId();
  if (!id) return null;
  return prisma.customer.findUnique({ where: { id } });
}
