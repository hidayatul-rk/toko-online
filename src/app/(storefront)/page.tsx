import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-2xl font-semibold">Selamat datang di Toko Online</h1>
        <p className="mt-2 text-black/60 dark:text-white/60">
          Belanja produk elektronik dan fashion pilihan.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Kategori</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/produk?kategori=${category.slug}`}
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Produk Terbaru</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/produk/${product.slug}`}
              className="group rounded-lg border border-black/10 p-3 text-sm transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-black/5 dark:bg-white/10">
                {product.stock === 0 && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
                    Stok Habis
                  </span>
                )}
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-black/20 dark:text-white/20">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-1 font-medium">{product.name}</p>
              <p className="text-black/60 dark:text-white/60">
                {product.category.name}
              </p>
              <p className="mt-1 font-semibold">
                {formatRupiah(product.price)}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/produk"
            className="inline-block rounded-md border border-black/10 px-5 py-2 text-sm transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            Lihat Semua Produk &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
