import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { createProduct } from "@/lib/admin-actions";

export default async function AdminProdukBaruPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Produk", href: "/admin/produk" },
          { label: "Tambah Baru" },
        ]}
      />
      <h1 className="text-xl font-semibold">Tambah Produk</h1>
      <ProductForm categories={categories} action={createProduct} />
    </div>
  );
}
