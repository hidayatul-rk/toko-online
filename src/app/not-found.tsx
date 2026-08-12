import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h1>
      <p className="text-black/60 dark:text-white/60">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
