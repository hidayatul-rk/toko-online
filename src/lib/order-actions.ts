"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSnap } from "@/lib/midtrans";

export async function checkout(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  if (!shippingAddress) throw new Error("Alamat pengiriman wajib diisi.");

  // Parse shippingOption: "methodId:price"
  const shippingOption = String(formData.get("shippingOption") ?? "").trim();
  let shippingMethodId: string | null = null;
  let shippingCost = 0;
  if (shippingOption) {
    const [mId, priceStr] = shippingOption.split(":");
    shippingMethodId = mId || null;
    shippingCost = Number(priceStr) || 0;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Keranjang kosong.");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const total = subtotal + shippingCost;

  // Validasi stok
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(
        `Stok "${item.product.name}" tidak mencukupi. Tersedia: ${item.product.stock}`,
      );
    }
  }

  // Kurangi stok produk
  await Promise.all(
    cart.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      }),
    ),
  );

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total,
      shippingCost,
      shippingMethodId,
      shippingAddress,
      status: "PENDING",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      payment: {
        create: {
          provider: "midtrans",
          status: "pending",
        },
      },
    },
  });

  const snap = await createSnap();

  let transaction;
  try {
    transaction = await snap.createTransaction({
      transaction_details: {
        order_id: order.id,
        gross_amount: total,
      },
      customer_details: {
        first_name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        phone: user?.phone ?? undefined,
      },
      item_details: cart.items.map((item) => ({
        id: item.productId,
        price: item.product.price,
        quantity: item.quantity,
        name: item.product.name,
      })),
      callbacks: {
        finish: `${process.env.AUTH_URL}/pesanan/${order.id}`,
      },
    });
  } catch (error) {
    // Gagal buat transaksi — batalkan order & kembalikan stok
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    await Promise.all(
      cart.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
      ),
    );
    throw new Error(
      "Gagal memproses pembayaran. Silakan coba lagi. Pastikan kunci Midtrans sudah dikonfigurasi di Pengaturan Admin.",
    );
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { rawResponse: transaction as unknown as object },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  redirect(transaction.redirect_url);
}

export async function cancelOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orderId = String(formData.get("orderId"));

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.status !== "PENDING") {
    throw new Error("Hanya pesanan dengan status Menunggu Pembayaran yang dapat dibatalkan.");
  }

  // Kembalikan stok
  await Promise.all(
    order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }),
    ),
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/pesanan/${orderId}`);
}
