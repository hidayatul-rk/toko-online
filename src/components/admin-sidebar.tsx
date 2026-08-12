"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
    dashboard: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
    ),
    produk: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    kategori: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
    pesanan: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    pengguna: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
    ),
    pengiriman: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
    ),
    pengaturan: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

export function AdminSidebar({
    adminName,
    pendingCount,
    signOutAction,
}: {
    adminName: string;
    pendingCount: number;
    signOutAction: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    function linkClass(href: string) {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${isActive ? "bg-black/5 font-medium dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`;
    }

    return (
        <>
            <button type="button" onClick={() => setOpen(!open)} className="fixed left-3 top-3 z-50 rounded-md border border-black/10 p-2 lg:hidden dark:border-white/10" aria-label="Toggle menu">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
            </button>

            {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

            <aside className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col gap-1 border-r border-black/10 bg-white p-4 pt-16 transition-transform dark:border-white/10 dark:bg-black lg:static lg:z-auto lg:pt-4 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Admin Info */}
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-medium dark:bg-white/10">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <p className="truncate text-sm font-semibold" title={adminName}>{adminName}</p>
                </div>

                {/* Dashboard */}
                <Link href="/admin" onClick={() => setOpen(false)} className={linkClass("/admin")}>
                    {ICONS.dashboard} Dashboard
                </Link>

                {/* Transaksi */}
                <p className="mt-2 px-3 text-[11px] font-medium uppercase tracking-wider text-black/30 dark:text-white/30">Transaksi</p>
                <Link href="/admin/pesanan" onClick={() => setOpen(false)} className={linkClass("/admin/pesanan")}>
                    {ICONS.pesanan}
                    <span className="flex-1">Pesanan</span>
                    {pendingCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            {pendingCount}
                        </span>
                    )}
                </Link>
                <Link href="/admin/pengiriman" onClick={() => setOpen(false)} className={linkClass("/admin/pengiriman")}>
                    {ICONS.pengiriman} Pengiriman
                </Link>

                {/* Master Data */}
                <p className="mt-2 px-3 text-[11px] font-medium uppercase tracking-wider text-black/30 dark:text-white/30">Master Data</p>
                <Link href="/admin/produk" onClick={() => setOpen(false)} className={linkClass("/admin/produk")}>
                    {ICONS.produk} Produk
                </Link>
                <Link href="/admin/kategori" onClick={() => setOpen(false)} className={linkClass("/admin/kategori")}>
                    {ICONS.kategori} Kategori
                </Link>
                <Link href="/admin/pengguna" onClick={() => setOpen(false)} className={linkClass("/admin/pengguna")}>
                    {ICONS.pengguna} Pengguna
                </Link>

                {/* Lainnya */}
                <p className="mt-2 px-3 text-[11px] font-medium uppercase tracking-wider text-black/30 dark:text-white/30">Lainnya</p>
                <Link href="/admin/pengaturan" onClick={() => setOpen(false)} className={linkClass("/admin/pengaturan")}>
                    {ICONS.pengaturan} Pengaturan
                </Link>

                <hr className="mx-3 my-2 border-black/10 dark:border-white/10" />

                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                    Ke Toko
                </Link>
                <form action={signOutAction}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                        Keluar
                    </button>
                </form>
            </aside>
        </>
    );
}
