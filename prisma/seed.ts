import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@toko-online.test" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@toko-online.test",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);
  await prisma.user.upsert({
    where: { email: "customer@toko-online.test" },
    update: {},
    create: {
      name: "Customer",
      email: "customer@toko-online.test",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

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
    create: {
      name: "Headphone Wireless",
      slug: "headphone-wireless",
      description: "Headphone wireless dengan noise cancelling.",
      price: 350000,
      stock: 25,
      images: [],
      categoryId: elektronik.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "kaos-polos-cotton" },
    update: {},
    create: {
      name: "Kaos Polos Cotton",
      slug: "kaos-polos-cotton",
      description: "Kaos polos bahan cotton combed 30s.",
      price: 75000,
      stock: 100,
      images: [],
      categoryId: fashion.id,
    },
  });

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
