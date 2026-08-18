import Link from "next/link";

export default function PaymentUnfinishPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">Pembayaran belum selesai</h1>
      <p className="mt-4 text-muted-foreground">Pembayaran belum selesai. Anda dapat kembali ke halaman pesanan untuk memeriksa statusnya.</p>
      <Link href="/pesanan" className="mt-8 inline-block rounded-md bg-primary px-5 py-3 text-primary-foreground">Lihat pesanan</Link>
    </main>
  );
}
