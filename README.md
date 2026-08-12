# 🛒 Toko Online

Aplikasi e-commerce full-stack dibangun dengan **Next.js 16** (App Router + Turbopack), **Prisma** ORM, **PostgreSQL**, **NextAuth v5**, **Tailwind CSS v4**, dan **Midtrans** payment gateway.

---

## ✨ Fitur

### 🏪 Storefront
| Fitur | Keterangan |
|-------|-----------|
| Homepage | Kategori + produk terbaru + link "Lihat Semua" |
| Katalog Produk | Pencarian, filter kategori, sorting (terbaru/harga/nama), paginasi 12/page |
| Detail Produk | Image gallery dengan thumbnail selector, produk terkait, stok badge |
| Keranjang | Tambah/update quantity/hapus item, validasi stok real-time |
| Checkout | Ringkasan pesanan + alamat pengiriman + ongkos kirim + pembayaran Midtrans Snap |
| Riwayat Pesanan | Daftar + detail pesanan, status badge berwarna |
| Batalkan Pesanan | Customer bisa batalkan pesanan PENDING, stok otomatis kembali |
| Profil | Edit nama, telepon, alamat lengkap (6 field: provinsi s/d detail alamat) |
| Global Search | Search bar di header untuk cari produk dari halaman mana pun |
| Cetak & Ekspor | Cetak detail pesanan & ekspor CSV |

### 🔐 Autentikasi
| Fitur | Keterangan |
|-------|-----------|
| Register | Validasi Zod, rate limiting (5x/15 menit per email) |
| Login | Credentials provider NextAuth v5, JWT session |
| Role-based | `CUSTOMER` dan `ADMIN`, proteksi rute via proxy |
| Logout | Server action dengan redirect |

### 🛡️ Admin Panel
| Fitur | Keterangan |
|-------|-----------|
| Dashboard | 6 stat cards (Produk, Pesanan, Pengguna, Pendapatan, Hari Ini, Stok Menipis) + 5 pesanan terbaru |
| Produk | CRUD + search + filter kategori + paginasi 10/page + thumbnail + toggle aktif/nonaktif |
| Upload Produk | Multi-image upload + preview + hapus individual + validasi tipe & ukuran file |
| Kategori | Tambah + edit inline + hapus dengan konfirmasi toast |
| Pesanan | Filter status (6 badge warna) + search + paginasi 8/page + detail lengkap + cetak |
| Detail Pesanan | Info customer, alamat, item, pembayaran, shipping method, update status |
| Pengguna | Daftar + search + ubah role (Admin ↔ Pelanggan) |
| Pengiriman | Kelola metode pengiriman & ongkos kirim (CRUD shipping method) |
| Pengaturan | Konfigurasi Midtrans Server Key & Client Key (simpan di DB) |
| UI/UX | Sidebar mobile hamburger, active link highlight, breadcrumb, loading skeleton, empty states |
| Notifikasi | Toast sonner untuk sukses/gagal (tambah, edit, hapus) |

### 💳 Pembayaran
| Fitur | Keterangan |
|-------|-----------|
| Midtrans Snap | Redirect ke halaman pembayaran Midtrans |
| Webhook | Validasi signature SHA512, auto-update status order |
| Error Handling | Gagal transaksi → batalkan order + kembalikan stok |
| Konfigurasi Dinamis | Server/Client key bisa diatur via Admin Panel (DB) atau `.env` |

### 🚚 Pengiriman
| Fitur | Keterangan |
|-------|-----------|
| Shipping Method | CRUD metode pengiriman (nama, kurir, layanan, harga) |
| Berat Produk | Set berat per produk (gram), dihitung otomatis saat checkout |
| Ongkos Kirim | Tersimpan di setiap order untuk referensi |

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

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Next.js | 16.3 | App Router, Turbopack |
| React | 19.2 | Server Components |
| TypeScript | 5.x | Type safety |
| Prisma | 6.19 | ORM + Migrations |
| PostgreSQL | 16 | Docker container |
| NextAuth | 5.0-beta | Authentication |
| Tailwind CSS | 4.x | Utility-first CSS |
| Midtrans Client | 1.4 | Payment gateway |
| Zod | 4.4 | Schema validation |
| bcryptjs | 3.0 | Password hashing |
| Sonner | 2.0 | Toast notifications |

---

## 📁 Struktur Project

```
toko-online/
├── prisma/
│   ├── schema.prisma              # Model: User, Category, Product, Cart, Order, Payment, Setting, ShippingMethod
│   ├── seed.ts                    # Data awal (admin, customer, kategori, produk)
│   └── migrations/                # Database migrations
├── public/uploads/                # Upload gambar produk (lokal)
├── src/
│   ├── app/
│   │   ├── (storefront)/          # Route group — halaman customer
│   │   │   ├── layout.tsx         #   Layout storefront (header, footer)
│   │   │   ├── page.tsx           #   Homepage
│   │   │   ├── produk/            #   Katalog & detail produk
│   │   │   ├── cart/              #   Keranjang belanja
│   │   │   ├── checkout/          #   Checkout & pembayaran
│   │   │   ├── pesanan/           #   Riwayat & detail pesanan
│   │   │   ├── profil/            #   Edit profil & alamat
│   │   │   ├── login/             #   Halaman login
│   │   │   └── register/          #   Halaman registrasi
│   │   ├── admin/                 # Route group — panel admin
│   │   │   ├── layout.tsx         #   Layout admin (sidebar)
│   │   │   ├── page.tsx           #   Dashboard
│   │   │   ├── produk/            #   CRUD produk
│   │   │   ├── kategori/          #   CRUD kategori
│   │   │   ├── pesanan/           #   Manajemen pesanan
│   │   │   ├── pengguna/          #   Manajemen pengguna
│   │   │   ├── pengiriman/        #   Shipping method
│   │   │   └── pengaturan/        #   Konfigurasi Midtrans
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/ #  NextAuth API route
│   │   │   └── payment/webhook/   #   Midtrans webhook handler
│   │   ├── layout.tsx             # Root layout (font, Toaster)
│   │   ├── globals.css            # Tailwind + CSS custom properties
│   │   ├── robots.ts              # robots.txt
│   │   ├── sitemap.ts             # Auto-generate sitemap
│   │   ├── error.tsx              # Error boundary
│   │   └── not-found.tsx          # 404 page
│   ├── components/
│   │   ├── site-header.tsx        # Navbar + global search + mobile menu
│   │   ├── product-form.tsx       # Form CRUD produk (multi-image, preview)
│   │   ├── product-gallery.tsx    # Image gallery + thumbnail selector
│   │   ├── add-to-cart-form.tsx   # Tombol & form tambah ke keranjang
│   │   ├── register-form.tsx      # Form registrasi dengan validasi
│   │   ├── admin-sidebar.tsx      # Sidebar navigasi + mobile hamburger
│   │   ├── delete-button.tsx      # Tombol hapus + konfirmasi dialog + toast
│   │   ├── inline-form.tsx        # Form inline edit + toast
│   │   ├── toast-form.tsx         # Form dengan notifikasi toast
│   │   ├── empty-state.tsx        # Ilustrasi state kosong + CTA
│   │   ├── breadcrumb.tsx         # Navigasi breadcrumb
│   │   ├── scroll-to-top.tsx      # Tombol scroll ke atas
│   │   ├── export-csv-button.tsx  # Ekspor data ke CSV
│   │   └── print-button.tsx       # Cetak halaman
│   ├── lib/
│   │   ├── auth.ts                # NextAuth v5 configuration
│   │   ├── auth-actions.ts        # Register + rate limiting
│   │   ├── admin-actions.ts       # Server actions: CRUD admin
│   │   ├── cart-actions.ts        # Server actions: keranjang
│   │   ├── order-actions.ts       # Server actions: checkout & cancel
│   │   ├── profile-actions.ts     # Server actions: update profil
│   │   ├── settings-actions.ts    # Server actions: baca/simpan settings
│   │   ├── shipping-actions.ts    # Server actions: shipping method
│   │   ├── export-actions.ts      # Server actions: ekspor CSV
│   │   ├── midtrans.ts            # Midtrans Snap client (dynamic keys)
│   │   ├── cart.ts                # Cart utility helpers
│   │   ├── settings.ts            # Settings utility
│   │   ├── format.ts              # formatRupiah & formatting helpers
│   │   ├── format-address.ts      # Format & validasi alamat
│   │   ├── rate-limit.ts          # In-memory rate limiter
│   │   └── prisma.ts              # Prisma client singleton
│   ├── proxy.ts                   # Route proxy (proteksi /admin)
│   └── types/                     # TypeScript declarations
│       ├── next-auth.d.ts         #   NextAuth type overrides
│       └── midtrans-client.d.ts   #   Midtrans client types
├── docker-compose.yml             # PostgreSQL 16 container
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.mjs              # ESLint flat config
├── postcss.config.mjs             # PostCSS + Tailwind
└── package.json
```

---

## 🗄️ Database Schema

| Model | Deskripsi |
|-------|-----------|
| `User` | Pengguna (role: CUSTOMER/ADMIN), profil & alamat |
| `Category` | Kategori produk |
| `Product` | Produk (nama, harga, stok, berat, gambar, status aktif) |
| `Cart` / `CartItem` | Keranjang belanja (one-to-one dengan User) |
| `Order` / `OrderItem` | Pesanan dengan status tracking (6 status) |
| `Payment` | Data pembayaran Midtrans |
| `Setting` | Key-value store untuk konfigurasi dinamis |
| `ShippingMethod` | Metode pengiriman (nama, kurir, layanan, harga) |

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk PostgreSQL)
- [Midtrans Sandbox Account](https://simulator.sandbox.midtrans.com/) (untuk testing pembayaran)

### 1. Clone & setup environment

```bash
git clone <repo-url> toko-online
cd toko-online
```

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/toko_online?schema=public"
AUTH_SECRET="<generate dengan `openssl rand -base64 32`>"
AUTH_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_IS_PRODUCTION="false"
```

> 💡 Midtrans keys juga bisa dikosongkan dulu dan diisi nanti via **Admin Panel → Pengaturan**.

### 2. Jalankan PostgreSQL

```bash
docker-compose up -d
```

### 3. Install dependencies & setup database

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

### Build Production

```bash
npm run build
npm start
```

### Environment Variables (Production)

| Variable | Keterangan |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL production |
| `AUTH_SECRET` | Secret key untuk JWT encryption |
| `AUTH_URL` | URL domain production (contoh: `https://tokoanda.com`) |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key (Live, tanpa prefix `SB-`) |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key (Live, tanpa prefix `SB-`) |
| `MIDTRANS_IS_PRODUCTION` | Harus `"true"` |

### Midtrans Webhook

Arahkan **Payment Notification URL** di dashboard Midtrans ke:
```
https://domain-anda.com/api/payment/webhook
```

---

## ⚠️ Catatan Penting

- **Upload Gambar**: Disimpan di `public/uploads/` secara lokal. Untuk deployment serverless (Vercel, dll.), ganti dengan object storage seperti S3, Cloudinary, atau UploadThing.
- **Rate Limiting**: Menggunakan in-memory storage — tidak cocok untuk multi-instance deployment. Gunakan Redis atau database untuk production multi-server.
- **Webhook Midtrans**: Endpoint `/api/payment/webhook` harus dapat diakses publik. Pastikan signature key di dashboard Midtrans sudah dikonfigurasi.
- **Proxy vs Middleware**: Project ini menggunakan `src/proxy.ts` (Next.js 16 proxy) sebagai pengganti middleware untuk proteksi rute `/admin`.

---

## 📄 Lisensi

MIT
