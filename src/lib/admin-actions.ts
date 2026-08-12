"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak.");
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function saveProductImage(image: File, slug: string) {
  if (!image || image.size === 0) return null;

  // Validasi tipe file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(image.type)) {
    throw new Error("Format gambar tidak didukung. Gunakan JPEG, PNG, WebP, atau AVIF.");
  }

  // Validasi ukuran (maks 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (image.size > maxSize) {
    throw new Error("Ukuran gambar terlalu besar. Maksimal 5MB.");
  }

  const ext = image.name.split(".").pop() || "jpg";
  const filename = `${slug}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await image.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function createCategory(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { success: false, message: "Nama kategori wajib diisi." };

    await prisma.category.create({
      data: { name, slug: slugify(name) },
    });

    revalidatePath("/admin/kategori");
    return { success: true, message: `Kategori "${name}" berhasil ditambahkan.` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menambah kategori.",
    };
  }
}

export async function deleteCategory(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const id = String(formData.get("id"));
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/kategori");
    return { success: true, message: "Kategori berhasil dihapus." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus kategori.",
    };
  }
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nama kategori wajib diisi.");

  await prisma.category.update({
    where: { id },
    data: { name, slug: slugify(name) },
  });

  revalidatePath("/admin/kategori");
}

async function saveProductImages(files: File[], slug: string): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const path = await saveProductImage(files[i], `${slug}-${i}`);
    if (path) results.push(path);
  }
  return results;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const weight = Number(formData.get("weight")) || 200;
  const categoryId = String(formData.get("categoryId"));

  if (!name || !categoryId || Number.isNaN(price) || Number.isNaN(stock)) {
    throw new Error("Data produk tidak lengkap.");
  }

  const slug = `${slugify(name)}-${Date.now()}`;

  const newImages = formData.getAll("newImages") as File[];
  const imagePaths = await saveProductImages(
    newImages.filter((f) => f.size > 0),
    slug,
  );

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      weight,
      stock,
      categoryId,
      images: imagePaths,
    },
  });

  redirect("/admin/produk");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const weight = Number(formData.get("weight")) || 200;
  const categoryId = String(formData.get("categoryId"));

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Produk tidak ditemukan.");

  const keepImages = formData.getAll("keepImages") as string[];
  const newImages = formData.getAll("newImages") as File[];
  const newImagePaths = await saveProductImages(
    newImages.filter((f) => f.size > 0),
    existing.slug,
  );

  const allImages = [...keepImages, ...newImagePaths];

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      weight,
      stock,
      categoryId,
      images: allImages,
    },
  });

  redirect("/admin/produk");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/admin/produk");
}

export async function deleteProduct(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const id = String(formData.get("id"));
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/produk");
    return { success: true, message: "Produk berhasil dihapus." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus produk.",
    };
  }
}

export async function updateOrderStatus(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const id = String(formData.get("id"));
    const status = String(formData.get("status")) as OrderStatus;

    await prisma.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/pesanan");
    revalidatePath(`/admin/pesanan/${id}`);
    return { success: true, message: `Status pesanan diubah ke ${status}.` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal update status.",
    };
  }
}

export async function updateUserRole(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, message: "Akses ditolak." };
    }
    const userId = String(formData.get("userId"));
    const role = String(formData.get("role")) as "CUSTOMER" | "ADMIN";

    // Cegah admin mengubah rolenya sendiri
    if (userId === session.user.id) {
      return { success: false, message: "Tidak dapat mengubah role sendiri." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: `Role diubah ke ${role === "ADMIN" ? "Admin" : "Pelanggan"}.` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengubah role.",
    };
  }
}
