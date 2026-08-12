import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-xl font-semibold">Daftar Akun</h1>
      <RegisterForm />
      <p className="text-sm text-black/60 dark:text-white/60">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
