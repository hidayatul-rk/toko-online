import { prisma } from "@/lib/prisma";
import { updateUserRole } from "@/lib/admin-actions";
import { ToastForm } from "@/components/toast-form";
import { Breadcrumb } from "@/components/breadcrumb";
import type { Prisma } from "@prisma/client";

const ROLE_LABEL: Record<string, string> = {
    CUSTOMER: "Pelanggan",
    ADMIN: "Admin",
};

export default async function AdminPenggunaPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const where: Prisma.UserWhereInput = {
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: true } } },
    });

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Pengguna" }]} />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">Pengguna ({users.length})</h1>
                <form action="/admin/pengguna" className="flex gap-2">
                    <input
                        type="text"
                        name="q"
                        placeholder="Cari nama atau email..."
                        defaultValue={q}
                        className="w-48 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
                    >
                        Cari
                    </button>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-black/10 text-left dark:border-white/10">
                            <th className="py-2">Nama</th>
                            <th className="py-2">Email</th>
                            <th className="py-2">Role</th>
                            <th className="py-2">Pesanan</th>
                            <th className="py-2">Tanggal Daftar</th>
                            <th className="py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-black/5 dark:border-white/5"
                            >
                                <td className="py-2">{user.name ?? "-"}</td>
                                <td className="py-2 text-black/60 dark:text-white/60">
                                    {user.email}
                                </td>
                                <td className="py-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                            }`}
                                    >
                                        {ROLE_LABEL[user.role]}
                                    </span>
                                </td>
                                <td className="py-2">{user._count.orders}</td>
                                <td className="py-2 text-black/60 dark:text-white/60">
                                    {user.createdAt.toLocaleDateString("id-ID")}
                                </td>
                                <td className="py-2 text-right">
                                    <ToastForm action={updateUserRole} className="flex items-center gap-2">
                                        <input type="hidden" name="userId" value={user.id} />
                                        <select
                                            name="role"
                                            defaultValue={user.role}
                                            className="rounded-md border border-black/10 px-2 py-1 text-xs dark:border-white/10"
                                        >
                                            <option value="CUSTOMER">Pelanggan</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="rounded-md bg-black px-2 py-1 text-xs text-white dark:bg-white dark:text-black"
                                        >
                                            Ubah
                                        </button>
                                    </ToastForm>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
