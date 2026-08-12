export default function AdminLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-7 w-32 rounded bg-black/5 dark:bg-white/10" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-black/10 p-4 dark:border-white/10"
          >
            <div className="h-4 w-20 rounded bg-black/5 dark:bg-white/10" />
            <div className="mt-2 h-8 w-16 rounded bg-black/5 dark:bg-white/10" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-black/10 p-4 dark:border-white/10"
          >
            <div className="h-4 w-3/4 rounded bg-black/5 dark:bg-white/10" />
            <div className="mt-2 h-3 w-1/2 rounded bg-black/5 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
