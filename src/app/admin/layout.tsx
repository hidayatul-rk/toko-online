import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const pendingCount = await prisma.order.count({ where: { status: "PENDING" } });

  return (
    <div className="flex min-h-full">
      <AdminSidebar
        adminName={session.user.name ?? session.user.email ?? "Admin"}
        pendingCount={pendingCount}
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      />
      <main className="flex-1 p-4 pt-16 lg:p-6 lg:pt-6">{children}</main>
    </div>
  );
}
