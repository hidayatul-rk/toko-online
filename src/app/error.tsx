"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Terjadi Kesalahan</h1>
      <p className="text-black/60 dark:text-white/60">
        {error.message || "Maaf, terjadi kesalahan yang tidak terduga."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
      >
        Coba Lagi
      </button>
    </div>
  );
}
