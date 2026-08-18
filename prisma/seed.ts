import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const customerEmail = process.env.SEED_CUSTOMER_EMAIL ?? "customer@toko-online.test";
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi saat menjalankan seed.");
  }
  if (adminPassword.length < 12) throw new Error("SEED_ADMIN_PASSWORD minimal 12 karakter.");
  if (customerPassword && customerPassword.length < 12) throw new Error("SEED_CUSTOMER_PASSWORD minimal 12 karakter.");

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash: adminPasswordHash, role: "ADMIN" },
    create: { name: "Admin", email: adminEmail.toLowerCase(), passwordHash: adminPasswordHash, role: "ADMIN" },
  });

  if (customerPassword) {
    const customerPasswordHash = await bcrypt.hash(customerPassword, 12);
    await prisma.user.upsert({
      where: { email: customerEmail.toLowerCase() },
      update: { passwordHash: customerPasswordHash, role: "CUSTOMER" },
      create: { name: "Customer", email: customerEmail.toLowerCase(), passwordHash: customerPasswordHash, role: "CUSTOMER" },
    });
  }

  const elektronik = await prisma.category.upsert({
    where: { slug: "elektronik" },
    update: {},
    create: { name: "Elektronik", slug: "elektronik" },
  });
  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: { name: "Fashion", slug: "fashion" },
  });

  await prisma.product.upsert({
    where: { slug: "headphone-wireless" },
    update: {},
    create: { name: "Headphone Wireless", slug: "headphone-wireless", description: "Headphone wireless dengan noise cancelling.", price: 350000, stock: 25, images: [], categoryId: elektronik.id },
  });
  await prisma.product.upsert({
    where: { slug: "kaos-polos-cotton" },
    update: {},
    create: { name: "Kaos Polos Cotton", slug: "kaos-polos-cotton", description: "Kaos polos bahan cotton combed 30s.", price: 75000, stock: 100, images: [], categoryId: fashion.id },
  });

  console.log("Seed selesai.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
