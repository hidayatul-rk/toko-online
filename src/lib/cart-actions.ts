"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return cart;
}

export async function addToCart(productId: string, quantity: number = 1) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cart");

  const cart = await requireCart(session.user.id);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });

  revalidatePath("/cart");
}

export async function addToCartAction(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity") ?? 1);

  await addToCart(productId, quantity);

  return { success: true, message: "Produk ditambahkan ke keranjang" };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cart");

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    // Validasi stok
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });
    if (cartItem && quantity > cartItem.product.stock) {
      throw new Error(`Stok tidak mencukupi. Maksimal: ${cartItem.product.stock}`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItem(cartItemId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cart");

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
}

export async function getCartForCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });
}
