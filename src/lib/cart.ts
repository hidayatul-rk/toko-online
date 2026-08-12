import { prisma } from "@/lib/prisma";

export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

export async function getCartWithItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });
  return cart;
}

export function cartTotal(items: { quantity: number; product: { price: number } }[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
}
