"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
});

export async function registerCustomer(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  // Rate limiting: maks 5 request per 15 menit per IP/email
  const emailKey = `register:${parsed.data.email}`;
  if (!checkRateLimit(emailKey)) {
    return { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
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
