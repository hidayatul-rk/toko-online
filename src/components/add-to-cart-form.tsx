"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { addToCartAction } from "@/lib/cart-actions";

export function AddToCartForm({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [state, formAction, isPending] = useActionState(
    addToCartAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 flex items-center gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input
        type="number"
        name="quantity"
        defaultValue={1}
        min={1}
        max={stock}
        className="w-20 rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
      />
      <button
        type="submit"
        disabled={stock === 0 || isPending}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {stock === 0
          ? "Stok habis"
          : isPending
            ? "Menambahkan..."
            : "Tambah ke Keranjang"}
      </button>
    </form>
  );
}
