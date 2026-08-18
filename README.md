# 🛒 Toko Online

Aplikasi e-commerce full-stack dibangun dengan **Next.js 16** (App Router + Turbopack), **Prisma** ORM, **PostgreSQL**, **NextAuth v5**, **Tailwind CSS v4**, dan **Midtrans** payment gateway.

## ✨ Fitur

### 🏪 Storefront
- Homepage, katalog, pencarian, filter, sorting, paginasi
- Detail produk dan gallery
- Keranjang dan validasi stok
- Checkout dengan ongkos kirim dan Midtrans Snap
- Riwayat dan pembatalan pesanan
- Profil dan alamat
- Cetak dan ekspor CSV

### 🔐 Autentikasi
- Register dengan validasi Zod
- Login Credentials + JWT session
- Role `CUSTOMER` / `ADMIN`
- Proteksi route admin

### 🛡️ Admin Panel
- Dashboard, CRUD produk/kategori
- Upload multi-image
- Manajemen pesanan dan shipping
- Manajemen pengguna dan role
- Pengaturan Midtrans

### 💳 Pembayaran
- Midtrans Snap
- Webhook dengan verifikasi signature SHA-512
- Validasi nominal terhadap order
- Proteksi terhadap notification yang datang terlambat
- Checkout dan perubahan stok menggunakan transaction database

## 🛠️ Tech Stack

Next.js 16 · React 19 · TypeScript · Prisma 6 · PostgreSQL 16 · NextAuth 5 · Tailwind CSS 4 · Midtrans · Zod · bcryptjs

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- Node.js 18+
- Docker Desktop
- Midtrans Sandbox Account

### 1. Setup environment

Buat `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/toko_online?schema=public"
AUTH_SECRET="<generate dengan openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_IS_PRODUCTION="false"

# Hanya diperlukan saat menjalankan prisma db seed
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="password-admin-minimal-12-karakter"
SEED_CUSTOMER_EMAIL="customer@example.com"
SEED_CUSTOMER_PASSWORD="password-customer-minimal-12-karakter"
```

> Jangan commit `.env` ke repository.

### 2. Jalankan PostgreSQL

```bash
docker-compose up -d
```

### 3. Install dependencies dan setup database

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

### 4. Jalankan aplikasi

```bash
npm run dev
```

## 🧪 CI

Repository memiliki workflow GitHub Actions yang menjalankan PostgreSQL, Prisma migration, lint, dan production build pada push/PR.

## 📦 Deployment

### Build production

```bash
npm run build
npm start
```

Environment production minimal:

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL production |
| `AUTH_SECRET` | Secret untuk JWT encryption |
| `AUTH_URL` | URL domain production |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk production |

### Midtrans Webhook

Arahkan Payment Notification URL ke:

```text
https://domain-anda.com/api/payment/webhook
```

## ⚠️ Catatan Production

- **Upload gambar** saat ini masih menggunakan `public/uploads/`. Untuk deployment serverless/multi-instance gunakan object storage seperti S3, Cloudinary, atau UploadThing.
- **Rate limiting** masih in-memory. Untuk multi-instance gunakan Redis atau database-backed rate limiter.
- **Midtrans secret** harus tetap server-side. Jangan expose Server Key ke client.
- **Stock checkout** menggunakan conditional update di dalam transaction untuk mencegah overselling.
- **Harga ongkir** dihitung ulang di server; nilai dari browser tidak dipercaya.
- **Order status** memiliki state transition yang dibatasi.

## 📄 Lisensi

MIT
