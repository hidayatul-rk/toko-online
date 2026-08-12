import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartForCurrentUser } from "@/lib/cart-actions";
import { checkout } from "@/lib/order-actions";
import { hasCompleteAddress, formatAddress } from "@/lib/format-address";
import { formatRupiah } from "@/lib/format";
import { getShippingCost, getCityId } from "@/lib/rajaongkir";
import type { CourierCode } from "@/lib/rajaongkir";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || !hasCompleteAddress(user)) redirect("/profil?callbackUrl=/checkout");

  const cart = await getCartForCurrentUser();
  const items = cart?.items ?? [];
  if (items.length === 0) redirect("/cart");

  // Konversi nama kota ke ID kota RajaOngkir
  const destinationCityId =
    user.kabupatenKota && user.provinsi
      ? (await getCityId(user.kabupatenKota, user.provinsi)) ?? ""
      : "";

  const shippingMethods = await prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalWeight = items.reduce((sum, item) => sum + item.product.weight * item.quantity, 0);

  type ShippingOption = { methodId: string; label: string; price: number };
  const shippingOptions: ShippingOption[] = [];

  for (const method of shippingMethods) {
    if (method.courier && destinationCityId) {
      const costs = await getShippingCost(
        destinationCityId,
        totalWeight,
        method.courier as CourierCode,
      );
      for (const c of costs) {
        shippingOptions.push({
          methodId: method.id,
          label: `${method.courier.toUpperCase()} ${c.service} (${c.description}) \u2014 ${c.etd} hari`,
          price: c.cost,
        });
      }
    } else {
      shippingOptions.push({
        methodId: method.id,
        label: `${method.name}${method.price === 0 ? " (Gratis)" : ""}`,
        price: method.price,
      });
    }
  }
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold">Checkout</h1>

      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product.name} x{item.quantity}
            </span>
            <span>
              {formatRupiah(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-sm dark:border-white/10">
          <span>Subtotal ({totalWeight}g)</span>
          <span className="font-medium">{formatRupiah(subtotal)}</span>
        </div>
      </div>

      {/* Metode Pengiriman */}
      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
        <span className="font-medium">Metode Pengiriman</span>
        {shippingOptions.length === 0 ? (
          <p className="text-black/40 dark:text-white/40">Belum ada metode pengiriman.</p>
        ) : (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {shippingOptions.map((opt, i) => (
              <label key={`${opt.methodId}-${i}`} className="flex items-center gap-2 py-1">
                <input
                  type="radio"
                  name="shippingOption"
                  value={`${opt.methodId}:${opt.price}`}
                  defaultChecked={i === 0}
                  className="text-black shrink-0"
                />
                <span className="flex-1 text-xs">{opt.label}</span>
                <span className="shrink-0 font-medium">
                  {opt.price === 0 ? "Gratis" : formatRupiah(opt.price)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="font-medium">Alamat Pengiriman</span>
          <Link href="/profil?callbackUrl=/checkout" className="underline">
            Ubah
          </Link>
        </div>
        <p className="whitespace-pre-line text-black/70 dark:text-white/70">
          {formatAddress(user)}
        </p>
      </div>

      <form action={checkout} className="flex flex-col gap-3">
        <input type="hidden" name="shippingAddress" value={formatAddress(user)} />
        <button
          type="submit"
          className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
        >
          Bayar dengan Midtrans
        </button>
      </form>
    </div>
  );
}
