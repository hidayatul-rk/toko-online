"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import type { OrderStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Akses ditolak.");
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function saveProductImage(image: File, slug: string) {
  if (!image || image.size === 0) return null;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(image.type)) throw new Error("Format gambar tidak didukung. Gunakan JPEG, PNG, WebP, atau AVIF.");
  if (image.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar terlalu besar. Maksimal 5MB.");
  const ext = image.name.split(".").pop() || "jpg";
  const filename = `${slug}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await image.arrayBuffer()));
  return `/uploads/${filename}`;
}

async function saveProductImages(files: File[], slug: string): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const saved = await saveProductImage(files[i], `${slug}-${i}`);
    if (saved) results.push(saved);
  }
  return results;
}

export async function createCategory(_prevState: { success: boolean; message: string } | null, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name || name.length > 100) return { success: false, message: "Nama kategori wajib diisi dan maksimal 100 karakter." };
    await prisma.category.create({ data: { name, slug: slugify(name) } });
    revalidatePath("/admin/kategori");
    return { success: true, message: `Kategori "${name}" berhasil ditambahkan.` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Gagal menambah kategori." };
  }
}

export async function deleteCategory(_prevState: { success: boolean; message: string } | null, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    await prisma.category.delete({ where: { id: String(formData.get("id") ?? "") } });
    revalidatePath("/admin/kategori");
    return { success: true, message: "Kategori berhasil dihapus." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Gagal menghapus kategori." };
  }
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 100) throw new Error("Nama kategori wajib diisi dan maksimal 100 karakter.");
  await prisma.category.update({ where: { id }, data: { name, slug: slugify(name) } });
  revalidatePath("/admin/kategori");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const weight = Number(formData.get("weight"));
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name || name.length > 200 || !description || description.length > 10000 || !categoryId || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0 || !Number.isSafeInteger(weight) || weight <= 0) throw new Error("Data produk tidak valid.");
  if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) throw new Error("Kategori tidak ditemukan.");
  const slug = `${slugify(name)}-${Date.now()}`;
  const imagePaths = await saveProductImages((formData.getAll("newImages") as File[]).filter((f) => f.size > 0), slug);
  await prisma.product.create({ data: { name, slug, description, price, weight, stock, categoryId, images: imagePaths } });
  redirect("/admin/produk");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const weight = Number(formData.get("weight"));
  const categoryId = String(formData.get("categoryId") ?? "");
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Produk tidak ditemukan.");
  if (!name || name.length > 200 || !description || description.length > 10000 || !categoryId || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0 || !Number.isSafeInteger(weight) || weight <= 0) throw new Error("Data produk tidak valid.");
  if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) throw new Error("Kategori tidak ditemukan.");
  const keepImages = (formData.getAll("keepImages") as string[]).filter((image) => existing.images.includes(image));
  const newImagePaths = await saveProductImages((formData.getAll("newImages") as File[]).filter((f) => f.size > 0), existing.slug);
  await prisma.product.update({ where: { id }, data: { name, description, price, weight, stock, categoryId, images: [...keepImages, ...newImagePaths] } });
  redirect("/admin/produk");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Produk tidak ditemukan.");
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/produk");
}

export async function deleteProduct(_prevState: { success: boolean; message: string } | null, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    await prisma.product.delete({ where: { id: String(formData.get("id") ?? "") } });
    revalidatePath("/admin/produk");
    return { success: true, message: "Produk berhasil dihapus." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Gagal menghapus produk." };
  }
}

export async function updateUserRole(_prevState: { success: boolean; message: string } | null, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Akses ditolak.");

    const userId = String(formData.get("userId") ?? "");
    const roleValue = String(formData.get("role") ?? "");
    const role: UserRole = roleValue === "ADMIN" ? "ADMIN" : roleValue === "CUSTOMER" ? "CUSTOMER" : (() => { throw new Error("Role tidak valid."); })();

    if (!userId) throw new Error("Pengguna tidak ditemukan.");
    if (userId === session.user.id && role !== "ADMIN") throw new Error("Anda tidak dapat menurunkan role akun admin yang sedang digunakan.");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new Error("Pengguna tidak ditemukan.");

    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin/pengguna");
    return { success: true, message: "Role pengguna berhasil diubah." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Gagal mengubah role pengguna." };
  }
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(_prevState: { success: boolean; message: string } | null, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const nextStatus = String(formData.get("status") ?? "") as OrderStatus;
    const validStatuses: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(nextStatus)) return { success: false, message: "Status tidak valid." };

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new Error("Pesanan tidak ditemukan.");
      if (order.status === nextStatus) return false;
      if (!allowedTransitions[order.status].includes(nextStatus)) throw new Error(`Transisi ${order.status} → ${nextStatus} tidak diizinkan.`);
      if (nextStatus === "CANCELLED") {
        for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      const updated = await tx.order.updateMany({ where: { id, status: order.status }, data: { status: nextStatus } });
      if (updated.count !== 1) throw new Error("Status pesanan berubah. Silakan muat ulang halaman.");
      return true;
    });

    revalidatePath("/admin/pesanan");
    revalidatePath(`/admin/pesanan/${id}`);
    return { success: true, message: result ? "Status pesanan berhasil diupdate." : "Status pesanan sudah sesuai." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Gagal update status pesanan." };
  }
}
