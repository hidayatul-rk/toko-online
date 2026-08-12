import Image from "next/image";
import { getSettings, updateSettings } from "@/lib/settings-actions";
import { SettingsTabs } from "./settings-tabs";

export default async function AdminPengaturanPage() {
    const settings = await getSettings();

    const tokoContent = (
        <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
                Nama Toko
                <input
                    type="text"
                    name="storeName"
                    defaultValue={settings.storeName}
                    placeholder="Toko Online"
                    className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm">
                Deskripsi Singkat
                <input
                    type="text"
                    name="storeDescription"
                    defaultValue={settings.storeDescription}
                    placeholder="Belanja online mudah dan cepat"
                    className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm">
                Logo Toko
                {settings.storeLogo && (
                    <Image
                        src={settings.storeLogo}
                        alt="Logo toko"
                        width={80}
                        height={40}
                        className="mb-1 h-10 w-auto rounded border border-black/10 object-contain p-1 dark:border-white/10"
                    />
                )}
                <input
                    type="file"
                    name="storeLogo"
                    accept="image/*"
                    className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                />
                <span className="text-xs text-black/40 dark:text-white/40">
                    Maks 2MB. JPEG, PNG, WebP, atau SVG.
                </span>
            </label>

            <label className="flex flex-col gap-1 text-sm">
                Ukuran Kertas Cetak
                <select
                    name="printPaperSize"
                    defaultValue={settings.printPaperSize}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                >
                    <option value="A4">A4 (210 x 297 mm) — Standar</option>
                    <option value="Letter">Letter (8.5 x 11 in)</option>
                    <option value="Thermal80">Thermal 80mm — Struk</option>
                    <option value="Thermal58">Thermal 58mm — Struk Kecil</option>
                </select>
                <span className="text-xs text-black/40 dark:text-white/40">
                    Digunakan saat mencetak resi/invoice.
                </span>
            </label>
        </div>
    );

    const rajaongkirContent = (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-black/40 dark:text-white/40">
                Daftar di{" "}
                <a href="https://rajaongkir.com" target="_blank" className="underline">
                    rajaongkir.com
                </a>{" "}
                untuk dapat API Key (Starter = gratis).
            </p>

            <label className="flex flex-col gap-1 text-sm">
                API Key
                <input
                    type="text"
                    name="rajaongkirApiKey"
                    defaultValue={settings.rajaongkirApiKey}
                    placeholder="Masukkan API Key RajaOngkir"
                    className="rounded-md border border-black/10 px-3 py-2 font-mono text-sm dark:border-white/10"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm">
                ID Kota Asal (Origin)
                <input
                    type="text"
                    name="rajaongkirOriginCity"
                    defaultValue={settings.rajaongkirOriginCity}
                    placeholder="Contoh: 501 (Yogyakarta)"
                    className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                />
                <span className="text-xs text-black/40 dark:text-white/40">
                    ID kota tempat toko kamu. Cek di dashboard RajaOngkir.
                </span>
            </label>
        </div>
    );

    const midtransContent = (
        <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
                Server Key
                <input
                    type="text"
                    name="midtransServerKey"
                    defaultValue={settings.midtransServerKey}
                    placeholder="SB-Mid-server-xxxxx"
                    className="rounded-md border border-black/10 px-3 py-2 font-mono text-sm dark:border-white/10"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm">
                Client Key
                <input
                    type="text"
                    name="midtransClientKey"
                    defaultValue={settings.midtransClientKey}
                    placeholder="SB-Mid-client-xxxxx"
                    className="rounded-md border border-black/10 px-3 py-2 font-mono text-sm dark:border-white/10"
                />
            </label>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    name="midtransIsProduction"
                    value="true"
                    defaultChecked={settings.midtransIsProduction === "true"}
                    className="rounded"
                />
                Mode Production (Live)
            </label>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                <p className="font-medium">Penting:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Sandbox: kunci <code>SB-Mid-</code></li>
                    <li>Production: kunci <code>Mid-</code></li>
                </ul>
            </div>
        </div>
    );

    const tabs = [
        { id: "toko", label: "🏪 Toko", content: tokoContent },
        { id: "ongkir", label: "🚚 Ongkir", content: rajaongkirContent },
        { id: "midtrans", label: "💳 Midtrans", content: midtransContent },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Pengaturan</h1>
            <SettingsTabs tabs={tabs} />
        </div>
    );
}
