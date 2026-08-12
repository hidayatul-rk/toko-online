"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Akses ditolak.");
    }
}

async function saveLogo(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
        throw new Error("Format logo tidak didukung. Gunakan JPEG, PNG, WebP, atau SVG.");
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        throw new Error("Ukuran logo terlalu besar. Maksimal 2MB.");
    }

    const ext = file.name.split(".").pop() || "png";
    const filename = `logo-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return `/uploads/${filename}`;
}

export async function getSettings() {
    await requireAdmin();

    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};

    for (const s of settings) {
        map[s.key] = s.value;
    }

    return {
        storeName: map["store_name"] ?? "",
        storeDescription: map["store_description"] ?? "",
        storeLogo: map["store_logo"] ?? "",
        printPaperSize: map["print_paper_size"] ?? "A4",
        rajaongkirApiKey: map["rajaongkir_api_key"] ?? "",
        rajaongkirOriginCity: map["rajaongkir_origin_city"] ?? "",
        midtransServerKey: map["midtrans_server_key"] ?? "",
        midtransClientKey: map["midtrans_client_key"] ?? "",
        midtransIsProduction: map["midtrans_is_production"] ?? "false",
    };
}

export async function updateSettings(formData: FormData) {
    await requireAdmin();

    const storeName = String(formData.get("storeName") ?? "").trim();
    const storeDescription = String(formData.get("storeDescription") ?? "").trim();
    const serverKey = String(formData.get("midtransServerKey") ?? "").trim();
    const clientKey = String(formData.get("midtransClientKey") ?? "").trim();
    const isProduction = formData.get("midtransIsProduction") === "true";
    const rajaongkirKey = String(formData.get("rajaongkirApiKey") ?? "").trim();
    const originCity = String(formData.get("rajaongkirOriginCity") ?? "").trim();

    // Upload logo
    const logoFile = formData.get("storeLogo") as File | null;
    const logoPath = logoFile ? await saveLogo(logoFile) : null;

    const entries: { key: string; value: string }[] = [];

    if (storeName) entries.push({ key: "store_name", value: storeName });
    if (storeDescription) entries.push({ key: "store_description", value: storeDescription });
    if (logoPath) entries.push({ key: "store_logo", value: logoPath });

    const paperSize = String(formData.get("printPaperSize") ?? "A4").trim();
    entries.push({ key: "print_paper_size", value: paperSize });

    if (serverKey) entries.push({ key: "midtrans_server_key", value: serverKey });
    if (clientKey) entries.push({ key: "midtrans_client_key", value: clientKey });
    entries.push({ key: "midtrans_is_production", value: isProduction.toString() });
    if (rajaongkirKey) entries.push({ key: "rajaongkir_api_key", value: rajaongkirKey });
    if (originCity) entries.push({ key: "rajaongkir_origin_city", value: originCity });

    for (const entry of entries) {
        await prisma.setting.upsert({
            where: { key: entry.key },
            update: { value: entry.value },
            create: entry,
        });
    }

    revalidatePath("/admin/pengaturan");
    revalidatePath("/");
}
