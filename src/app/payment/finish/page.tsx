import Link from "next/link";

export default function PaymentFinishPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">Pembayaran selesai</h1>
      <p className="mt-4 text-muted-foreground">Pembayaran Anda telah selesai diproses. Status pesanan akan diperbarui setelah notifikasi pembayaran diterima.</p>
      <Link href="/pesanan" className="mt-8 inline-block rounded-md bg-primary px-5 py-3 text-primary-foreground">Lihat pesanan</Link>
    </main>
  );
}
