import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { updateProduct } from "@/lib/admin-actions";

export default async function AdminProdukEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Produk", href: "/admin/produk" },
          { label: product.name },
        ]}
      />
      <h1 className="text-xl font-semibold">Edit Produk</h1>
      <ProductForm categories={categories} product={product} action={updateProduct} />
    </div>
  );
}
