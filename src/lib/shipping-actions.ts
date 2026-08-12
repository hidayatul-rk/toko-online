"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Akses ditolak.");
    }
}

export async function createShippingMethod(
    _prevState: { success: boolean; message: string } | null,
    formData: FormData,
): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const name = String(formData.get("name") ?? "").trim();
        const courier = String(formData.get("courier") ?? "").trim() || null;
        const price = Number(formData.get("price"));

        if (!name && !courier) {
            return { success: false, message: "Nama atau kurir wajib dipilih." };
        }

        await prisma.shippingMethod.create({
            data: {
                name: name || courier?.toUpperCase() || "Pengiriman",
                courier,
                price: courier ? 0 : price,
            },
        });
        revalidatePath("/admin/pengiriman");
        return { success: true, message: `Metode "${name || courier}" berhasil ditambahkan.` };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Gagal menambah metode pengiriman.",
        };
    }
}

export async function updateShippingMethod(
    _prevState: { success: boolean; message: string } | null,
    formData: FormData,
): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const id = String(formData.get("id"));
        const name = String(formData.get("name") ?? "").trim();
        const price = Number(formData.get("price"));
        const isActive = formData.get("isActive") === "true";

        await prisma.shippingMethod.update({
            where: { id },
            data: { name: name || undefined, price: Number.isNaN(price) ? undefined : price, isActive },
        });
        revalidatePath("/admin/pengiriman");
        return { success: true, message: "Metode pengiriman berhasil diupdate." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Gagal update metode pengiriman.",
        };
    }
}

export async function deleteShippingMethod(
    _prevState: { success: boolean; message: string } | null,
    formData: FormData,
): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const id = String(formData.get("id"));
        await prisma.shippingMethod.delete({ where: { id } });
        revalidatePath("/admin/pengiriman");
        return { success: true, message: "Metode pengiriman berhasil dihapus." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Gagal menghapus metode pengiriman.",
        };
    }
}
