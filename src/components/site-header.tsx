import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export async function SiteHeader() {
  const session = await auth();
  const storeName = await getSetting("store_name", "Toko Online");
  const storeLogo = await getSetting("store_logo");

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold shrink-0">
          {storeLogo && (
            <Image
              src={storeLogo}
              alt={storeName}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          )}
          {storeName}
        </Link>
        <form action="/produk" className="hidden sm:flex flex-1 max-w-xs mx-4">
          <input
            type="text"
            name="q"
            placeholder="Cari produk..."
            className="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
          />
        </form>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/produk">Produk</Link>
          <Link href="/cart">Keranjang</Link>
          {session?.user ? (
            <>
              <span className="text-black/60 dark:text-white/60">
                Halo, {session.user.name ?? session.user.email}
              </span>
              <Link href="/pesanan">Pesanan Saya</Link>
              <Link href="/profil">Profil</Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">Admin</Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="underline">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Masuk</Link>
              <Link href="/register">Daftar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
