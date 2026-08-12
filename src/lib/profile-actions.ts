"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profil");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const namaTempat = String(formData.get("namaTempat") ?? "").trim();
  const provinsi = String(formData.get("provinsi") ?? "").trim();
  const kabupatenKota = String(formData.get("kabupatenKota") ?? "").trim();
  const kecamatan = String(formData.get("kecamatan") ?? "").trim();
  const desaKelurahan = String(formData.get("desaKelurahan") ?? "").trim();
  const detailAlamat = String(formData.get("detailAlamat") ?? "").trim();

  if (
    !namaTempat ||
    !provinsi ||
    !kabupatenKota ||
    !kecamatan ||
    !desaKelurahan ||
    !detailAlamat
  ) {
    throw new Error("Semua field alamat wajib diisi.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || null,
      phone: phone || null,
      namaTempat,
      provinsi,
      kabupatenKota,
      kecamatan,
      desaKelurahan,
      detailAlamat,
    },
  });

  revalidatePath("/profil");
  revalidatePath("/checkout");

  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  redirect(callbackUrl.startsWith("/") ? callbackUrl : "/profil");
}
