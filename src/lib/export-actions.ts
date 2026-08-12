"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function exportOrdersCsv(): Promise<string> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Akses ditolak.");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = ["ID", "Pelanggan", "Email", "Status", "Total", "Ongkir", "Tanggal"];
  const rows = orders.map((o) => [
    o.id,
    o.user.name ?? "-",
    o.user.email,
    o.status,
    String(o.total),
    String(o.shippingCost),
    o.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

  return csv;
}
