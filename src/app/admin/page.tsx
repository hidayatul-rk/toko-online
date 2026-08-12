import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { Breadcrumb } from "@/components/breadcrumb";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    productCount,
    orderCount,
    userCount,
    revenue,
    pendingOrders,
    todayOrders,
    todayRevenue,
    lowStock,
    outOfStock,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const highlights: string[] = [];
  if (lowStock > 0) highlights.push(`${lowStock} menipis`);
  if (outOfStock > 0) highlights.push(`${outOfStock} habis`);

  const cards = [
    { label: "Produk", value: productCount, href: "/admin/produk", highlight: highlights.length > 0 ? highlights.join(", ") : undefined },
    { label: "Pesanan", value: orderCount, href: "/admin/pesanan", highlight: pendingOrders > 0 ? `${pendingOrders} menunggu` : undefined },
    { label: "Pengguna", value: userCount, href: "/admin/pengguna" },
    { label: "Pendapatan", value: formatRupiah(revenue._sum.total ?? 0), href: "/admin/pesanan?status=PAID" },
    { label: "Pesanan Hari Ini", value: todayOrders, href: "/admin/pesanan", highlight: todayRevenue._sum.total ? formatRupiah(todayRevenue._sum.total) : undefined },
    { label: "Stok Menipis", value: lowStock, href: "/admin/produk?stok=menipis" },
    { label: "Stok Habis", value: outOfStock, href: "/admin/produk?stok=habis" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-black/10 p-4 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            <p className="text-sm text-black/60 dark:text-white/60">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            {card.highlight && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{card.highlight}</p>
            )}
          </Link>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Pesanan Terbaru</h2>
            <Link href="/admin/pesanan" className="text-xs underline">Lihat Semua</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pesanan/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-black/10 p-3 text-sm transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
              >
                <div>
                  <span className="font-mono text-xs">{order.id.slice(0, 12)}...</span>
                  <span className="ml-2 text-black/60 dark:text-white/60">{order.user.name ?? order.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${order.status === "PENDING" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                      order.status === "PAID" || order.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        order.status === "CANCELLED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="font-medium">{formatRupiah(order.total)}</span>
                  <span className="text-xs text-black/40 dark:text-white/40">{order.createdAt.toLocaleDateString("id-ID")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
