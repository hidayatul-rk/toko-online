import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  // Redirect jika sudah login
  if (session?.user) redirect("/");

  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-xl font-semibold">Masuk</h1>
      <LoginForm callbackUrl={callbackUrl} />
      <p className="text-sm text-black/60 dark:text-white/60">
        Belum punya akun?{" "}
        <Link href="/register" className="underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
