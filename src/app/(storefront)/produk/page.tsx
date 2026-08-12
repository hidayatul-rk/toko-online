import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

export default async function ProdukListPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string; page?: string; sort?: string }>;
}) {
  const { kategori, q, page: pageParam, sort } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(kategori ? { category: { slug: kategori } } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [categories, products, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (kategori) params.set("kategori", kategori);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/produk?${qs}` : "/produk";
  }

  function sortHref(sortValue: string) {
    const params = new URLSearchParams();
    if (kategori) params.set("kategori", kategori);
    if (q) params.set("q", q);
    if (sortValue) params.set("sort", sortValue);
    const qs = params.toString();
    return qs ? `/produk?${qs}` : "/produk";
  }

  function catHref(catSlug: string) {
    const params = new URLSearchParams();
    if (catSlug) params.set("kategori", catSlug);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/produk?${qs}` : "/produk";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Produk</h1>

      <form action="/produk" className="flex max-w-sm gap-2">
        {kategori && <input type="hidden" name="kategori" value={kategori} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        <input
          type="text"
          name="q"
          placeholder="Cari produk..."
          defaultValue={q}
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
        />
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Cari
        </button>
      </form>

      {/* Kategori Filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={catHref("")}
          className={`rounded-full border px-4 py-1.5 text-sm ${!kategori
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-black/10 dark:border-white/10"
            }`}
        >
          Semua
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={catHref(category.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm ${kategori === category.slug
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/10 dark:border-white/10"
              }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-black/60 dark:text-white/60">Urutkan:</span>
        {[
          { label: "Terbaru", value: "" },
          { label: "Harga: Rendah → Tinggi", value: "price-asc" },
          { label: "Harga: Tinggi → Rendah", value: "price-desc" },
          { label: "Nama A-Z", value: "name" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={sortHref(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs ${(sort ?? "") === opt.value
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/10 dark:border-white/10"
              }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/produk/${product.slug}`}
            className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-black/5 dark:bg-white/10">
              {product.stock === 0 && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  Stok Habis
                </span>
              )}
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
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
        {products.length === 0 && (
          <p className="col-span-full text-black/60 dark:text-white/60">
            {q ? "Produk tidak ditemukan." : "Belum ada produk pada kategori ini."}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded-md border border-black/10 px-3 py-1.5 dark:border-white/10 ${page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
          >
            Sebelumnya
          </Link>
          <span className="text-black/60 dark:text-white/60">
            Halaman {page} dari {totalPages}
          </span>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={`rounded-md border border-black/10 px-3 py-1.5 dark:border-white/10 ${page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
          >
            Berikutnya
          </Link>
        </div>
      )}
    </div>
  );
}
