import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { SettingsTabs } from "@/components/client/settings-tabs";

export default async function SettingsLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUserWithOrg();

  if (!user) redirect("/login");
  if (user.userType === "admin") redirect("/admin");
  if (!user.organizationId) redirect("/dashboard");

  const canAccessRoles = hasPermission(user, "roles.read");
  const canAccessUsers = hasPermission(user, "users.read");
  const canAccessLogs = hasPermission(user, "logs.read");
  if (!canAccessRoles && !canAccessUsers && !canAccessLogs) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona roles, permisos y usuarios de tu organización.
        </p>
      </header>

      <SettingsTabs
        canAccessRoles={canAccessRoles}
        canAccessUsers={canAccessUsers}
        canAccessLogs={canAccessLogs}
      />

      {children}
    </div>
  );
}
