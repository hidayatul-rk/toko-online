import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin-actions";
import { DeleteButton } from "@/components/delete-button";
import { InlineForm } from "@/components/inline-form";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function AdminKategoriPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Kategori" }]} />
      <h1 className="text-xl font-semibold">Kategori</h1>

      <InlineForm
        action={createCategory}
        placeholder="Nama kategori baru"
        buttonLabel="Tambah"
      />

      {categories.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">Belum ada kategori.</p>
      ) : (
        <table className="w-full max-w-xl text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="py-2">Nama</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Produk</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2">
                  <form action={updateCategory} className="flex gap-1">
                    <input type="hidden" name="id" value={category.id} />
                    <input
                      type="text"
                      name="name"
                      defaultValue={category.name}
                      required
                      className="w-full min-w-[120px] rounded border border-transparent px-1 py-0.5 text-sm hover:border-black/10 focus:border-black/20 dark:hover:border-white/10 dark:focus:border-white/20"
                    />
                    <button type="submit" className="shrink-0 text-xs underline">
                      Simpan
                    </button>
                  </form>
                </td>
                <td className="py-2 text-black/60 dark:text-white/60">{category.slug}</td>
                <td className="py-2">{category._count.products}</td>
                <td className="py-2 text-right">
                  <DeleteButton id={category.id} action={deleteCategory} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
