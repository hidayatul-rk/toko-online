# 🛒 Toko Online

Aplikasi e-commerce full-stack dibangun dengan **Next.js 16** (App Router + Turbopack), **Prisma** ORM, **PostgreSQL**, **NextAuth v5**, dan **Midtrans** payment gateway.

---

## ✨ Fitur

### 🏪 Storefront
| Fitur | Keterangan |
|-------|-----------|
| Homepage | Kategori + produk terbaru + link "Lihat Semua" |
| Katalog Produk | Pencarian, filter kategori, sorting (terbaru/harga/nama), paginasi 12/page |
| Detail Produk | Image gallery dengan thumbnail selector, produk terkait, stok badge |
| Keranjang | Tambah/update quantity/hapus item, validasi stok real-time |
| Checkout | Ringkasan pesanan + alamat pengiriman + pembayaran Midtrans Snap |
| Riwayat Pesanan | Daftar + detail pesanan, status badge berwarna |
| Batalkan Pesanan | Customer bisa batalkan pesanan PENDING, stok otomatis kembali |
| Profil | Edit nama, telepon, alamat lengkap (6 field terpisah) |
| Global Search | Search bar di header untuk cari produk dari halaman mana pun |

### 🔐 Autentikasi
| Fitur | Keterangan |
|-------|-----------|
| Register | Validasi Zod, rate limiting (5x/15 menit per email) |
| Login | Credentials provider NextAuth v5, JWT session |
| Role-based | `CUSTOMER` dan `ADMIN`, middleware proteksi rute |
| Logout | Server action dengan redirect |

### 🛡️ Admin Panel
| Fitur | Keterangan |
|-------|-----------|
| Dashboard | 6 stat cards (Produk, Pesanan, Pengguna, Pendapatan, Hari Ini, Stok Menipis) + 5 pesanan terbaru |
| Produk | CRUD + search + filter kategori + paginasi 10/page + thumbnail |
| Produk Upload | Multi-image upload + preview + hapus individual + validasi (tipe & ukuran) |
| Kategori | Tambah + edit inline + hapus dengan konfirmasi toast |
| Pesanan | Filter status (6 badge warna) + search + paginasi 8/page + detail lengkap |
| Detail Pesanan | Info customer, alamat, item, pembayaran, update status |
| Pengguna | Daftar + search + ubah role (Admin ↔ Pelanggan) |
| Pengaturan | Konfigurasi Midtrans Server Key & Client Key (simpan di DB) |
| UI/UX | Sidebar mobile hamburger, active link highlight, breadcrumb, loading skeleton, empty states |
| Notifikasi | Toast sonner untuk sukses/gagal (tambah, edit, hapus) |

### 💳 Pembayaran
| Fitur | Keterangan |
|-------|-----------|
| Midtrans Snap | Redirect ke halaman pembayaran Midtrans |
| Webhook | Validasi signature SHA512, auto-update status order |
| Error Handling | Gagal transaksi → batalkan order + kembalikan stok |
| Konfigurasi | Server/Client key bisa diatur via Admin Panel (DB) atau `.env` |

### 🔍 SEO & Performa
| Fitur | Keterangan |
|-------|-----------|
| Metadata | Title, description, OpenGraph image per produk |
| Sitemap | Auto-generate dari database (homepage + semua produk) |
| Robots | Allow `/`, block `/admin/` & `/api/` |
| Loading | Skeleton loading di storefront & admin |

### 🎨 UX/UI
| Fitur | Keterangan |
|-------|-----------|
| Dark Mode | Support penuh light/dark via Tailwind `dark:` |
| Responsive | Mobile-first, sidebar hamburger di admin |
| Toast | Sonner rich colors untuk semua feedback |
| Empty States | Ilustrasi + CTA untuk cart kosong, pesanan kosong |
| Scroll to Top | Tombol ↑ muncul saat scroll >400px |
| Footer | Copyright + info harga |
| Stok Warning | Merah (0), Kuning (≤5) di admin & badge di storefront |
| Konfirmasi Hapus | Dialog "Yakin? Ya / Batal" sebelum hapus |

---

## 🛠️ Tech Stack

| Teknologi | Versi |
|-----------|-------|
| Next.js | 16.3 (App Router, Turbopack) |
| React | 19.2 |
| TypeScript | 5.x |
| Prisma | 6.19 |
| PostgreSQL | 16 (Docker) |
| NextAuth | 5.0-beta |
| Tailwind CSS | 4.x |
| Midtrans Client | 1.4 |
| Zod | 4.4 |
| bcryptjs | 3.0 |
| Sonner | 2.0 (toast) |

---

## 📁 Struktur Project

```
toko-online/
├── prisma/
│   ├── schema.prisma          # Model: User, Product, Category, Cart, Order, Payment, Setting
│   ├── seed.ts                # Data awal (admin, customer, 2 produk)
│   └── migrations/
├── public/uploads/            # Upload gambar produk
├── src/
│   ├── app/
│   │   ├── (storefront)/      # Halaman customer (/, /produk, /cart, /checkout, /pesanan, /profil)
│   │   ├── admin/             # Panel admin (/admin, /admin/produk, /admin/pesanan, dll)
│   │   ├── api/auth/          # NextAuth API route
│   │   ├── api/payment/       # Midtrans webhook
│   │   ├── layout.tsx         # Root layout (font, sonner Toaster)
│   │   ├── robots.ts          # robots.txt
│   │   └── sitemap.ts         # Auto sitemap
│   ├── components/
│   │   ├── site-header.tsx    # Navbar + global search
│   │   ├── product-form.tsx    # Form produk (multi-image, preview, hapus)
│   │   ├── product-gallery.tsx # Gallery selector di detail
│   │   ├── add-to-cart-form.tsx
│   │   ├── register-form.tsx
│   │   ├── admin-sidebar.tsx   # Sidebar + mobile hamburger
│   │   ├── delete-button.tsx   # Konfirmasi hapus + toast
│   │   ├── inline-form.tsx     # Form inline + toast
│   │   ├── empty-state.tsx     # Ilustrasi kosong + CTA
│   │   ├── breadcrumb.tsx      # Navigasi breadcrumb
│   │   └── scroll-to-top.tsx   # Tombol scroll atas
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── auth-actions.ts    # Register + rate limit
│   │   ├── admin-actions.ts   # CRUD admin (kategori, produk, pesanan, user)
│   │   ├── cart-actions.ts    # Cart server actions
│   │   ├── order-actions.ts   # Checkout + cancel order
│   │   ├── profile-actions.ts # Update profil
│   │   ├── settings-actions.ts# Baca/simpan settings
│   │   ├── midtrans.ts        # Midtrans Snap client (dynamic keys)
│   │   ├── cart.ts            # Cart helpers
│   │   ├── format.ts          # formatRupiah
│   │   ├── format-address.ts  # Format & validasi alamat
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   └── prisma.ts          # Prisma singleton
│   ├── proxy.ts               # Middleware proteksi admin
│   └── types/                 # Type declarations (next-auth, midtrans-client)
├── docker-compose.yml         # PostgreSQL 16
├── .env.example               # Template environment variables
└── package.json
```

---

## 🚀 Menjalankan Secara Lokal

### 1. Clone & setup environment

```bash
git clone <repo-url> toko-online
cd toko-online
cp .env.example .env
```

Isi `.env` dengan nilai yang sesuai:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/toko_online?schema=public"
AUTH_SECRET="<generate dengan `openssl rand -base64 32`>"
AUTH_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_IS_PRODUCTION="false"
```

> 💡 Midtrans keys juga bisa diisi nanti via Admin Panel → Pengaturan.

### 2. Jalankan PostgreSQL

```bash
docker-compose up -d
```

### 3. Install & setup database

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Default (Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@toko-online.test` | `Admin123!` |
| Customer | `customer@toko-online.test` | `Customer123!` |

---

## 📦 Deployment

```bash
npm run build
npm start
```

Pastikan environment variables production sudah di-set:
- `MIDTRANS_IS_PRODUCTION="true"`
- `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY` menggunakan kunci Live (tanpa `SB-`)
- `AUTH_URL` mengarah ke domain production

---

## 📄 Lisensi

MIT

Buka [http://localhost:3000](http://localhost:3000).

## Akun Seed

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@toko-online.test | Admin123! |
| Customer | customer@toko-online.test | Customer123! |

## Struktur Proyek

```
prisma/            Schema, migrasi, dan seed database
src/app/            Route Next.js App Router
  (storefront)/      Halaman customer: produk, keranjang, checkout, pesanan
  admin/             Panel admin
  api/               Route handler (auth, webhook Midtrans)
src/components/     Komponen UI yang dipakai bersama
src/lib/            Server actions & utilitas (auth, cart, prisma, midtrans)
src/proxy.ts        Proxy Next.js 16 (pengganti middleware) untuk guard /admin
```

## Catatan

- Upload gambar produk disimpan ke `public/uploads/` secara lokal — untuk deployment ke platform serverless (mis. Vercel), ganti dengan object storage (S3, Cloudinary, dll).
- Webhook Midtrans diarahkan ke `/api/payment/webhook` — pastikan URL ini dapat diakses publik saat mengonfigurasi notification URL di dashboard Midtrans.
