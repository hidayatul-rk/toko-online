"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // Rate limiting: maks 5 percobaan per 15 menit per email
  const rateKey = `login:${email}`;
  if (!checkRateLimit(rateKey)) {
    return { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw err;
  }
}
