import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppSidebar } from "@/components/client/app-sidebar";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        variant="admin"
        links={[
          { href: "/admin", label: "Resumen", icon: "dashboard" },
          { href: "/admin/users", label: "Usuarios", icon: "users" },
          { href: "/admin/logs", label: "Logs", icon: "logs" },
          { href: "/admin/profile", label: "Mi perfil", icon: "profile" }
        ]}
      />
      <main className="flex-1 overflow-y-auto bg-background px-8 py-8">{children}</main>
    </div>
  );
}

