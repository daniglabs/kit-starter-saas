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

  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        variant="customer"
        links={[{ href: "/dashboard", label: "Resumen", icon: "dashboard" }]}
      />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}

