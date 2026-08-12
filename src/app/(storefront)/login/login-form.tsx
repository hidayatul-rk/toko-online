"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">
          {state.error}
        </p>
      )}

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 pr-10 dark:border-white/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
