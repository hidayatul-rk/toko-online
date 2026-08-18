"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
  email: z.string().trim().toLowerCase().email("Email tidak valid").max(254, "Email terlalu panjang"),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password terlalu panjang"),
  confirmPassword: z.string(),
});

export async function registerCustomer(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const emailKey = `register:${parsed.data.email}`;
  if (!checkRateLimit(emailKey)) {
    return { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email sudah terdaftar." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  return { success: true };
}
