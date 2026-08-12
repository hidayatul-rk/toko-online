import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductGallery } from "@/components/product-gallery";
import { formatRupiah } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true },
  });
  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProdukDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gambar */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-black/60 dark:text-white/60">
            {product.category.name}
          </p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-xl font-semibold">
            {formatRupiah(product.price)}
          </p>
          <p className="text-black/70 dark:text-white/70">
            {product.description}
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Stok: {product.stock}
          </p>

          <AddToCartForm productId={product.id} stock={product.stock} />
        </div>
      </div>

      {/* Produk Terkait */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Produk Terkait</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/produk/${p.slug}`}
                className="rounded-lg border border-black/10 p-3 text-sm transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-black/5 dark:bg-white/10">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-black/20 dark:text-white/20">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 font-medium">{p.name}</p>
                <p className="font-semibold">{formatRupiah(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
