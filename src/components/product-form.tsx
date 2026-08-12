"use client";

import { useState } from "react";
import Image from "next/image";
import type { Category, Product } from "@prisma/client";

type Props = {
  categories: Category[];
  product?: Product;
  action: (formData: FormData) => void;
};

export function ProductForm({ categories, product, action }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [keepImages, setKeepImages] = useState<string[]>(product?.images ?? []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    // Cleanup old previews
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(urls);
  }

  function removeExistingImage(index: number) {
    setKeepImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="flex max-w-lg flex-col gap-3">
      {product && <input type="hidden" name="id" value={product.id} />}

      {keepImages.map((img, i) => (
        <input key={`keep-${i}`} type="hidden" name="keepImages" value={img} />
      ))}

      <label className="flex flex-col gap-1 text-sm">
        Nama Produk
        <input
          type="text"
          name="name"
          required
          defaultValue={product?.name}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Kategori
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Deskripsi
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>

      {/* Gambar Produk */}
      <div className="flex flex-col gap-2 text-sm">
        <span>Gambar Produk</span>

        {/* Existing images */}
        {keepImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keepImages.map((img, i) => (
              <div key={img} className="group relative h-24 w-24">
                <Image
                  src={img}
                  alt={`Gambar ${i + 1}`}
                  fill
                  className="rounded-md object-cover"
                  sizes="96px"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                  title="Hapus gambar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New file previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <div key={url} className="relative h-24 w-24 rounded-md border border-dashed border-black/20 dark:border-white/20">
                <Image
                  src={url}
                  alt={`Preview ${i + 1}`}
                  fill
                  className="rounded-md object-cover"
                  sizes="96px"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          name="newImages"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
        />
        <span className="text-xs text-black/40 dark:text-white/40">
          Bisa pilih beberapa gambar. Maks 5MB per gambar (JPEG, PNG, WebP, AVIF).
        </span>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Harga (Rp)
          <input
            type="number"
            name="price"
            required
            min={0}
            defaultValue={product?.price}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Stok
          <input
            type="number"
            name="stock"
            required
            min={0}
            defaultValue={product?.stock}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>
        <label className="flex w-28 flex-col gap-1 text-sm">
          Berat (g)
          <input
            type="number"
            name="weight"
            required
            min={1}
            defaultValue={product?.weight ?? 200}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
          <span className="text-[10px] text-black/40 dark:text-white/40">Untuk ongkir</span>
        </label>
      </div>

      <button
        type="submit"
        className="mt-2 rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
      >
        {product ? "Simpan Perubahan" : "Tambah Produk"}
      </button>
    </form>
  );
}
