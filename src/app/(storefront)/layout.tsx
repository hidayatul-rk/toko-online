import { SiteHeader } from "@/components/site-header";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40 dark:border-white/10 dark:text-white/40">
        &copy; {new Date().getFullYear()} Toko Online. Semua harga dalam Rupiah.
      </footer>
      <ScrollToTop />
    </div>
  );
}
