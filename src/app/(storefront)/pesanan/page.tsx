import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default async function PesananPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/pesanan");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan kamu akan muncul di sini setelah checkout."
          actionLabel="Mulai Belanja"
          actionHref="/produk"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pesanan/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10"
            >
              <div>
                <p className="font-medium">
                  {order.items.length} produk &middot;{" "}
                  {order.createdAt.toLocaleString("id-ID")}
                </p>
                <p className="text-black/60 dark:text-white/60">
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
              </div>
              <p className="font-semibold">
                {formatRupiah(order.total)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
