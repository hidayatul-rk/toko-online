"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomer } from "@/lib/auth-actions";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerCustomer, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950">
          Registrasi berhasil! Silakan masuk.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-black px-5 py-2 text-center text-white dark:bg-white dark:text-black"
        >
          Ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Nama
        <input
          type="text"
          name="name"
          required
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Konfirmasi Password
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={6}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
