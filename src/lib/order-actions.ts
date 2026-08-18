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

  const shippingMethodIdRaw = String(formData.get("shippingMethodId") ?? "").trim();
  const shippingMethodId = shippingMethodIdRaw || null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw new Error("Keranjang kosong.");

  const shippingMethod = shippingMethodId
    ? await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } })
    : null;
  if (shippingMethodId && (!shippingMethod || !shippingMethod.isActive)) {
    throw new Error("Metode pengiriman tidak tersedia.");
  }

  const shippingCost = shippingMethod?.price ?? 0;
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const total = subtotal + shippingCost;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        throw new Error(`Stok "${item.product.name}" tidak mencukupi.`);
      }
    }

    return tx.order.create({
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
        payment: { create: { provider: "midtrans", status: "pending" } },
      },
    });
  });

  const snap = await createSnap();
  let transaction;
  try {
    transaction = await snap.createTransaction({
      transaction_details: { order_id: order.id, gross_amount: total },
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
      callbacks: { finish: `${process.env.AUTH_URL}/pesanan/${order.id}` },
    });
  } catch {
    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id }, select: { status: true } });
      if (current?.status !== "PENDING") return;
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      for (const item of cart.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    });
    throw new Error("Gagal memproses pembayaran. Silakan coba lagi.");
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      transactionId: transaction.token ?? null,
      rawResponse: transaction as unknown as object,
    },
  });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  redirect(transaction.redirect_url);
}

export async function cancelOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orderId = String(formData.get("orderId") ?? "");

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.userId !== session.user.id) throw new Error("Pesanan tidak ditemukan.");
    if (order.status !== "PENDING") throw new Error("Hanya pesanan dengan status Menunggu Pembayaran yang dapat dibatalkan.");

    const changed = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (changed.count !== 1) throw new Error("Pesanan sudah diproses.");

    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  });
  revalidatePath(`/pesanan/${orderId}`);
}
