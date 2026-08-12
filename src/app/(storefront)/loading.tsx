export default function StorefrontLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-black/10 p-3 dark:border-white/10">
          <div className="aspect-square rounded-md bg-black/5 dark:bg-white/10" />
          <div className="mt-2 h-4 w-3/4 rounded bg-black/5 dark:bg-white/10" />
          <div className="mt-1 h-4 w-1/2 rounded bg-black/5 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}
