import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppSidebar } from "@/components/client/app-sidebar";
import { BackofficeTopbar } from "@/components/client/backoffice-topbar";

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

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      icon: "settings" as const
    },
    { href: "/dashboard/profile", label: "Mi perfil", icon: "profile" as const }
  ];

  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row md:items-stretch">
      <AppSidebar variant="customer" links={links} />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <BackofficeTopbar variant="customer" userName={user.name} />
        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </section>
      </main>
    </div>
  );
}

