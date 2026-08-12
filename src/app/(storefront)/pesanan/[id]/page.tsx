import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { cancelOrder } from "@/lib/order-actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/pesanan/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, payment: true, shippingMethod: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link href="/pesanan" className="text-sm underline">
          &larr; Kembali ke Pesanan Saya
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Detail Pesanan</h1>
      </div>

      {order.status === "PAID" && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-4 text-sm text-green-700 dark:text-green-400">
          Pembayaran berhasil diterima. Pesananmu akan segera diproses.
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60">ID Pesanan</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60">Status</span>
          <span className="font-medium">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60">Tanggal</span>
          <span className="font-medium">
            {order.createdAt.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60">
            Alamat Pengiriman
          </span>
          <span className="text-right font-medium">
            {order.shippingAddress}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product.name} x{item.quantity}
            </span>
            <span>{formatRupiah(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.shippingCost > 0 && (
          <div className="flex justify-between text-sm text-black/60 dark:text-white/60">
            <span>Ongkir{order.shippingMethod ? ` (${order.shippingMethod.name})` : ""}</span>
            <span>{formatRupiah(order.shippingCost)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-semibold dark:border-white/10">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      {order.status === "PENDING" && (
        <form action={cancelOrder}>
          <input type="hidden" name="orderId" value={order.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Batalkan Pesanan
          </button>
        </form>
      )}
    </div>
  );
}
