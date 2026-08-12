import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { deleteProduct, toggleProductActive } from "@/lib/admin-actions";
import { DeleteButton } from "@/components/delete-button";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

export default async function AdminProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; kategori?: string; stok?: string }>;
}) {
  const { page: pageParam, q, kategori, stok } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(kategori ? { category: { slug: kategori } } : {}),
    ...(stok === "menipis" ? { stock: { lte: 5, gt: 0 } } : {}),
    ...(stok === "habis" ? { stock: 0 } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kategori) params.set("kategori", kategori);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/produk?${qs}` : "/admin/produk";
  }

  function catHref(catSlug: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (catSlug) params.set("kategori", catSlug);
    const qs = params.toString();
    return qs ? `/admin/produk?${qs}` : "/admin/produk";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produk ({total})</h1>
        <Link
          href="/admin/produk/baru"
          className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Tambah Produk
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/produk" className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Cari produk..."
            defaultValue={q}
            className="w-48 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={catHref("")}
            className={`rounded-full border px-3 py-1 text-xs ${!kategori
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/10 dark:border-white/10"
              }`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={catHref(cat.slug)}
              className={`rounded-full border px-3 py-1 text-xs ${kategori === cat.slug
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/10 dark:border-white/10"
                }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">Belum ada produk.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left dark:border-white/10">
                  <th className="py-2"></th>
                  <th className="py-2">Nama</th>
                  <th className="py-2">Kategori</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Stok</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-2">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-black/5 dark:bg-white/10">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-black/20 dark:text-white/20">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <form action={toggleProductActive}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </form>
                        {product.name}
                      </div>
                    </td>
                    <td className="py-2 text-black/60 dark:text-white/60">
                      {product.category.name}
                    </td>
                    <td className="py-2">{formatRupiah(product.price)}</td>
                    <td className="py-2">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= 5
                              ? "text-amber-600"
                              : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/produk/${product.id}`} className="underline">
                          Edit
                        </Link>
                        <DeleteButton id={product.id} action={deleteProduct} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </>
      )}
    </div>
  );
}
