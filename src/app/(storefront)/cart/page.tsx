import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getCartForCurrentUser,
  updateCartItemQuantity,
  removeCartItem,
} from "@/lib/cart-actions";
import { formatRupiah } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cart");

  const cart = await getCartForCurrentUser();
  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  async function updateAction(formData: FormData) {
    "use server";
    const cartItemId = String(formData.get("cartItemId"));
    const quantity = Number(formData.get("quantity"));
    await updateCartItemQuantity(cartItemId, quantity);
  }

  async function removeAction(formData: FormData) {
    "use server";
    const cartItemId = String(formData.get("cartItemId"));
    await removeCartItem(cartItemId);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Keranjang masih kosong"
          description="Tambahkan produk favorit kamu dari katalog kami."
          actionLabel="Mulai Belanja"
          actionHref="/produk"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-black/10 p-3 dark:border-white/10"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/5 dark:bg-white/10">
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {formatRupiah(item.product.price)}
                </p>
              </div>
              <form action={updateAction} className="flex items-center gap-2">
                <input type="hidden" name="cartItemId" value={item.id} />
                <input
                  type="number"
                  name="quantity"
                  defaultValue={item.quantity}
                  min={0}
                  max={item.product.stock}
                  className="w-16 rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/10"
                />
                <button
                  type="submit"
                  className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/10"
                >
                  Update
                </button>
              </form>
              <form action={removeAction}>
                <input type="hidden" name="cartItemId" value={item.id} />
                <button type="submit" className="text-sm text-red-600 underline">
                  Hapus
                </button>
              </form>
              <p className="w-28 text-right font-medium">
                {formatRupiah(item.product.price * item.quantity)}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
            <p className="text-lg font-semibold">
              Total: {formatRupiah(total)}
            </p>
            <Link
              href="/checkout"
              className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
