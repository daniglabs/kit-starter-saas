import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppSidebar } from "@/components/client/app-sidebar";

export default async function CustomerLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:items-stretch">
      <AppSidebar
        variant="customer"
        links={[
          { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
          { href: "/dashboard/settings", label: "Configuración", icon: "settings" },
          { href: "/dashboard/profile", label: "Mi perfil", icon: "profile" }
        ]}
      />
      <main className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}

