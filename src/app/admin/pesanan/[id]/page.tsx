import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/lib/admin-actions";
import { ToastForm } from "@/components/toast-form";
import { Breadcrumb } from "@/components/breadcrumb";

const STATUS_LABEL: Record<string, string> = { PENDING: "Menunggu Pembayaran", PAID: "Sudah Dibayar", PROCESSING: "Diproses", SHIPPED: "Dikirim", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
const STATUS_COLOR: Record<string, string> = { PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", PAID: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", SHIPPED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400", COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;

export default async function AdminPesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { user: true, items: { include: { product: true } }, payment: true, shippingMethod: true } });
    if (!order) notFound();

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div className="flex items-center justify-between"><div><Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Pesanan", href: "/admin/pesanan" }, { label: order.id.slice(0, 12) + "..." }]} /><h1 className="text-xl font-semibold">Detail Pesanan</h1></div><Link href={`/admin/pesanan/${order.id}/cetak`} target="_blank" className="rounded-md border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">🖨️ Cetak</Link></div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"><div className="flex items-center gap-3"><span className="text-sm text-black/60 dark:text-white/60">Status:</span><span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOR[order.status] ?? ""}`}>{STATUS_LABEL[order.status] ?? order.status}</span></div><ToastForm action={updateOrderStatus} className="flex items-center gap-2"><input type="hidden" name="id" value={order.id} /><select name="status" defaultValue={order.status} className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10">{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select><button type="submit" className="rounded-md bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">Update</button></ToastForm></div>

            <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10"><h2 className="font-medium">Informasi Pesanan</h2><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">ID Pesanan</span><span className="font-mono">{order.id}</span></div><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Tanggal</span><span>{order.createdAt.toLocaleString("id-ID")}</span></div><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Total</span><span className="font-semibold">{formatRupiah(order.total)}</span></div></div>

            <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10"><h2 className="font-medium">Pelanggan</h2><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Nama</span><span>{order.user.name ?? "-"}</span></div><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Email</span><span>{order.user.email}</span></div>{order.user.phone && <div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Telepon</span><span>{order.user.phone}</span></div>}</div>

            <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10"><h2 className="font-medium">Alamat Pengiriman</h2><p className="whitespace-pre-line text-black/70 dark:text-white/70">{order.shippingAddress}</p></div>

            <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10"><h2 className="font-medium">Item Pesanan</h2>{order.items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.product.name} x{item.quantity}</span><span>{formatRupiah(item.price * item.quantity)}</span></div>)}{order.shippingCost > 0 && <div className="flex justify-between text-sm text-black/60 dark:text-white/60"><span>Ongkir{order.shippingMethod ? ` (${order.shippingMethod.name})` : ""}</span><span>{formatRupiah(order.shippingCost)}</span></div>}<div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-sm font-semibold dark:border-white/10"><span>Total</span><span>{formatRupiah(order.total)}</span></div></div>

            {order.payment && <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10"><h2 className="font-medium">Pembayaran</h2><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Provider</span><span>{order.payment.provider}</span></div><div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Status</span><span className="font-medium">{order.payment.status}</span></div>{order.payment.transactionId && <div className="flex justify-between"><span className="text-black/60 dark:text-white/60">Transaction ID</span><span className="font-mono text-xs">{order.payment.transactionId}</span></div>}</div>}
        </div>
    );
}
