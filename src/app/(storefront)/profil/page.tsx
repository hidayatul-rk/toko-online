import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/lib/profile-actions";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profil");

  const { callbackUrl } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold">Profil Saya</h1>

      {callbackUrl && (
        <p className="rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Lengkapi alamat pengiriman terlebih dahulu sebelum checkout.
        </p>
      )}

      <form action={updateProfile} className="flex flex-col gap-3">
        {callbackUrl && (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        )}

        <label className="flex flex-col gap-1 text-sm">
          Nama
          <input
            type="text"
            name="name"
            defaultValue={user.name ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            defaultValue={user.email}
            disabled
            className="rounded-md border border-black/10 bg-black/5 px-3 py-2 text-black/60 dark:border-white/10 dark:bg-white/10 dark:text-white/60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Nomor Telepon
          <input
            type="tel"
            name="phone"
            defaultValue={user.phone ?? ""}
            placeholder="0812-3456-7890"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Nama Tempat (Kantor/Rumah/Kos)
          <input
            type="text"
            name="namaTempat"
            required
            defaultValue={user.namaTempat ?? ""}
            placeholder="Contoh: Rumah, Kantor, Kos"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Provinsi
          <input
            type="text"
            name="provinsi"
            required
            defaultValue={user.provinsi ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Kabupaten / Kota
          <input
            type="text"
            name="kabupatenKota"
            required
            defaultValue={user.kabupatenKota ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Kecamatan
          <input
            type="text"
            name="kecamatan"
            required
            defaultValue={user.kecamatan ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Desa / Kelurahan
          <input
            type="text"
            name="desaKelurahan"
            required
            defaultValue={user.desaKelurahan ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Detail Alamat (Jalan, No. Rumah, RT/RW, Kode Pos)
          <textarea
            name="detailAlamat"
            required
            rows={3}
            defaultValue={user.detailAlamat ?? ""}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
