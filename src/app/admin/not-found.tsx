import Link from "next/link";

export default function AdminNotFound() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="rounded-full bg-black/5 p-6 dark:bg-white/10">
                <svg className="h-12 w-12 text-black/20 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-xl font-semibold">Halaman Tidak Ditemukan</h1>
            <p className="text-sm text-black/60 dark:text-white/60">
                Halaman admin yang kamu cari tidak ada.
            </p>
            <Link
                href="/admin"
                className="rounded-md bg-black px-5 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
                Kembali ke Dashboard
            </Link>
        </div>
    );
}
