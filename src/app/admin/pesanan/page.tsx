import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/lib/admin-actions";
import { ToastForm } from "@/components/toast-form";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { OrderStatus, Prisma } from "@prisma/client";

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const satisfies readonly OrderStatus[];
const STATUS_LABEL: Record<string, string> = { PENDING: "Menunggu Pembayaran", PAID: "Sudah Dibayar", PROCESSING: "Diproses", SHIPPED: "Dikirim", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
const STATUS_COLOR: Record<string, string> = { PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", PAID: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", SHIPPED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400", COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };

function parseStatus(value: string | undefined): OrderStatus | undefined {
  return value && (STATUS_OPTIONS as readonly string[]).includes(value) ? value as OrderStatus : undefined;
}

export default async function AdminPesananPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const { status: rawStatus, q, page: pageParam } = await searchParams;
  const status = parseStatus(rawStatus);
  const page = Math.max(1, Number(pageParam) || 1);
  const PAGE_SIZE = 8;
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ id: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }] } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { user: true, items: { include: { product: true } }, payment: true }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function filterHref(statusValue: string) {
    const sp = new URLSearchParams();
    if (statusValue && statusValue !== "ALL") sp.set("status", statusValue);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/pesanan?${qs}` : "/admin/pesanan";
  }
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/pesanan?${qs}` : "/admin/pesanan";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold">Pesanan ({total})</h1><ExportCsvButton /><form action="/admin/pesanan" className="flex gap-2">{status && <input type="hidden" name="status" value={status} />}<input type="text" name="q" placeholder="Cari ID atau nama..." defaultValue={q} className="w-48 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10" /><button type="submit" className="rounded-md bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">Cari</button></form></div>
      <div className="flex flex-wrap gap-2"><Link href={filterHref("ALL")} className={`rounded-full border px-3 py-1 text-xs ${!status ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/10 dark:border-white/10"}`}>Semua</Link>{STATUS_OPTIONS.map((s) => <Link key={s} href={filterHref(s)} className={`rounded-full border px-3 py-1 text-xs ${status === s ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/10 dark:border-white/10"}`}>{STATUS_LABEL[s]}</Link>)}</div>
      <div className="flex flex-col gap-4">{orders.map((order) => <div key={order.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="flex items-center gap-2"><p className="font-mono text-sm font-medium">{order.id.slice(0, 12)}...</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? ""}`}>{STATUS_LABEL[order.status] ?? order.status}</span></div><p className="text-sm text-black/60 dark:text-white/60">{order.user.name ?? order.user.email} · {order.createdAt.toLocaleString("id-ID")}</p></div><ToastForm action={updateOrderStatus} className="flex items-center gap-2"><input type="hidden" name="id" value={order.id} /><select name="status" defaultValue={order.status} className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10">{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select><button type="submit" className="rounded-md bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">Update</button></ToastForm></div><div className="mt-3 flex flex-col gap-1 text-sm">{order.items.map((item) => <div key={item.id} className="flex justify-between"><span>{item.product.name} x{item.quantity}</span><span>{formatRupiah(item.price * item.quantity)}</span></div>)}</div><div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-sm dark:border-white/10"><span className="text-black/60 dark:text-white/60" title={order.shippingAddress}>{order.shippingAddress.slice(0, 50)}{order.shippingAddress.length > 50 ? "..." : ""}</span><div className="flex items-center gap-3"><span className="font-semibold">{formatRupiah(order.total)}</span><Link href={`/admin/pesanan/${order.id}`} className="text-xs underline">Detail</Link></div></div></div>)}{orders.length === 0 && <p className="text-black/60 dark:text-white/60">{q ? "Pesanan tidak ditemukan." : "Belum ada pesanan."}</p>}</div>
      {totalPages > 1 && <div className="flex items-center justify-center gap-4 text-sm"><Link href={pageHref(page - 1)} aria-disabled={page <= 1} className={`rounded-md border border-black/10 px-3 py-1.5 dark:border-white/10 ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}>Sebelumnya</Link><span className="text-black/60 dark:text-white/60">Halaman {page} dari {totalPages}</span><Link href={pageHref(page + 1)} aria-disabled={page >= totalPages} className={`rounded-md border border-black/10 px-3 py-1.5 dark:border-white/10 ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>Berikutnya</Link></div>}
    </div>
  );
}
