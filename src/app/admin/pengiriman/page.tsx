import { prisma } from "@/lib/prisma";
import { COURIERS } from "@/lib/rajaongkir";
import { createShippingMethod, updateShippingMethod, deleteShippingMethod } from "@/lib/shipping-actions";
import { DeleteButton } from "@/components/delete-button";
import { ToastForm } from "@/components/toast-form";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function AdminPengirimanPage() {
    const methods = await prisma.shippingMethod.findMany({
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { orders: true } } },
    });

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Pengiriman" }]} />
            <div>
                <h1 className="text-xl font-semibold">Metode Pengiriman</h1>
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">Metode dengan kurir akan hitung ongkir otomatis via RajaOngkir. Tanpa kurir = ongkir manual.</p>
            </div>

            <ToastForm action={createShippingMethod} className="flex max-w-lg flex-wrap gap-2">
                <input type="text" name="name" placeholder="Nama metode (opsional untuk kurir)" className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" />
                <select name="courier" defaultValue="" className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10">
                    <option value="">Manual (isi biaya)</option>
                    {COURIERS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <input type="number" name="price" placeholder="Biaya (Rp)" min={0} defaultValue={0} className="w-28 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" />
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">Tambah</button>
            </ToastForm>

            {methods.length === 0 ? <p className="text-black/60 dark:text-white/60">Belum ada metode pengiriman.</p> : (
                <table className="w-full max-w-3xl text-sm">
                    <thead><tr className="border-b border-black/10 text-left dark:border-white/10"><th className="py-2">Nama</th><th className="py-2">Kurir</th><th className="py-2">Biaya</th><th className="py-2">Status</th><th className="py-2">Pesanan</th><th className="py-2"></th></tr></thead>
                    <tbody>{methods.map((method) => (
                        <tr key={method.id} className="border-b border-black/5 dark:border-white/5">
                            <td className="py-2">{method.name || method.courier?.toUpperCase() || "-"}</td>
                            <td className="py-2">{method.courier ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{method.courier.toUpperCase()}</span> : <span className="text-black/30 dark:text-white/30">Manual</span>}</td>
                            <td className="py-2">
                                {method.courier ? <span className="text-xs text-black/40 dark:text-white/40">Auto via API</span> : (
                                    <ToastForm action={updateShippingMethod} className="flex items-center gap-1">
                                        <input type="hidden" name="id" value={method.id} /><input type="hidden" name="name" value={method.name} /><input type="hidden" name="isActive" value={String(method.isActive)} />
                                        <span>Rp</span><input type="number" name="price" defaultValue={method.price} min={0} className="w-20 rounded border border-transparent px-1 py-0.5 hover:border-black/10 focus:border-black/20 dark:hover:border-white/10 dark:focus:border-white/20" /><button type="submit" className="text-xs underline">OK</button>
                                    </ToastForm>
                                )}
                            </td>
                            <td className="py-2">
                                <ToastForm action={updateShippingMethod}>
                                    <input type="hidden" name="id" value={method.id} /><input type="hidden" name="name" value={method.name} /><input type="hidden" name="price" value={method.price} /><input type="hidden" name="courier" value={method.courier ?? ""} />
                                    <button type="submit" name="isActive" value={method.isActive ? "false" : "true"} className={`rounded-full px-2 py-0.5 text-xs font-medium ${method.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{method.isActive ? "Aktif" : "Nonaktif"}</button>
                                </ToastForm>
                            </td>
                            <td className="py-2 text-black/60 dark:text-white/60">{method._count.orders}</td>
                            <td className="py-2 text-right"><DeleteButton id={method.id} action={deleteShippingMethod} /></td>
                        </tr>
                    ))}</tbody>
                </table>
            )}
        </div>
    );
}
